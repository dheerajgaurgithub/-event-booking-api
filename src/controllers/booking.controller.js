import { sequelize } from "../config/database.config.js"
import { Event, Booking, User } from "../models/index.js"
import { sendResponse } from "../utils/response.util.js"
import { catchAsync } from "../utils/catchAsync.util.js"
import { AppError } from "../utils/appError.util.js"

export const createBooking = catchAsync(async (req, res, next) => {
  const { eventId, numberOfTickets } = req.body
  const userId = req.user.id

  // Use transaction to ensure data consistency
  const result = await sequelize.transaction(async (t) => {
    // Find the event
    const event = await Event.findOne({
      where: { id: eventId, isActive: true },
      lock: true,
      transaction: t,
    })

    if (!event) {
      throw new AppError("Event not found", 404)
    }

    // Check if event is in the future
    if (new Date(event.dateTime) <= new Date()) {
      throw new AppError("Cannot book tickets for past events", 400)
    }

    // Check if user already has a confirmed booking for this event
    const existingBooking = await Booking.findOne({
      where: { userId, eventId, status: "confirmed" },
      transaction: t,
    })

    if (existingBooking) {
      throw new AppError("You already have a confirmed booking for this event", 400)
    }

    // Check seat availability
    if (event.availableSeats < numberOfTickets) {
      throw new AppError(`Only ${event.availableSeats} seats available`, 400)
    }

    // Calculate total amount
    const totalAmount = Number.parseFloat(event.price) * numberOfTickets

    // Create booking
    const booking = await Booking.create(
      {
        userId,
        eventId,
        numberOfTickets,
        totalAmount,
        status: "confirmed",
      },
      { transaction: t },
    )

    // Update available seats
    await event.update(
      {
        availableSeats: event.availableSeats - numberOfTickets,
      },
      { transaction: t },
    )

    // Fetch booking with related data
    const bookingWithDetails = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["id", "title", "dateTime", "location", "price"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      transaction: t,
    })

    return bookingWithDetails
  })

  sendResponse(
    res,
    201,
    {
      booking: result,
    },
    "Booking created successfully",
  )
})

export const getMyBookings = catchAsync(async (req, res) => {
  const userId = req.user.id
  const { page = 1, limit = 10, status } = req.query
  const offset = (page - 1) * limit

  const whereClause = { userId }
  if (status) {
    whereClause.status = status
  }

  const { count, rows: bookings } = await Booking.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Event,
        as: "event",
        attributes: ["id", "title", "description", "dateTime", "location", "price", "imageUrl"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: Number.parseInt(limit),
    offset: Number.parseInt(offset),
  })

  const totalPages = Math.ceil(count / limit)

  sendResponse(
    res,
    200,
    {
      bookings,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalBookings: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    "Bookings retrieved successfully",
  )
})

export const getBookingById = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const userId = req.user.id
  const userRole = req.user.role

  const whereClause = { id }

  // Non-admin users can only see their own bookings
  if (userRole !== "admin") {
    whereClause.userId = userId
  }

  const booking = await Booking.findOne({
    where: whereClause,
    include: [
      {
        model: Event,
        as: "event",
        attributes: ["id", "title", "description", "dateTime", "location", "price", "imageUrl"],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
  })

  if (!booking) {
    return next(new AppError("Booking not found", 404))
  }

  sendResponse(
    res,
    200,
    {
      booking,
    },
    "Booking retrieved successfully",
  )
})

export const cancelBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { reason } = req.body
  const userId = req.user.id

  // Use transaction to ensure data consistency
  const result = await sequelize.transaction(async (t) => {
    // Find the booking
    const booking = await Booking.findOne({
      where: { id, userId, status: "confirmed" },
      include: [
        {
          model: Event,
          as: "event",
        },
      ],
      lock: true,
      transaction: t,
    })

    if (!booking) {
      throw new AppError("Booking not found or already cancelled", 404)
    }

    // Check if event is in the future (allow cancellation up to 24 hours before event)
    const eventDate = new Date(booking.event.dateTime)
    const now = new Date()
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60)

    if (hoursUntilEvent < 24) {
      throw new AppError("Cannot cancel booking less than 24 hours before the event", 400)
    }

    // Update booking status
    await booking.update(
      {
        status: "cancelled",
        cancellationDate: new Date(),
        cancellationReason: reason,
      },
      { transaction: t },
    )

    // Restore available seats
    await booking.event.update(
      {
        availableSeats: booking.event.availableSeats + booking.numberOfTickets,
      },
      { transaction: t },
    )

    return booking
  })

  sendResponse(
    res,
    200,
    {
      booking: result,
    },
    "Booking cancelled successfully",
  )
})

export const getAllBookings = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, eventId } = req.query
  const offset = (page - 1) * limit

  const whereClause = {}
  if (status) {
    whereClause.status = status
  }
  if (eventId) {
    whereClause.eventId = eventId
  }

  const { count, rows: bookings } = await Booking.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Event,
        as: "event",
        attributes: ["id", "title", "dateTime", "location", "price"],
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: Number.parseInt(limit),
    offset: Number.parseInt(offset),
  })

  const totalPages = Math.ceil(count / limit)

  sendResponse(
    res,
    200,
    {
      bookings,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalBookings: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    "All bookings retrieved successfully",
  )
})
