import { Op } from "sequelize"
import { Event, User, Booking } from "../models/index.js"
import { sendResponse } from "../utils/response.util.js"
import { catchAsync } from "../utils/catchAsync.util.js"
import { AppError } from "../utils/appError.util.js"

export const createEvent = catchAsync(async (req, res) => {
  const eventData = {
    ...req.body,
    createdBy: req.user.id,
  }

  const event = await Event.create(eventData)

  // Fetch the created event with creator details
  const eventWithCreator = await Event.findByPk(event.id, {
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName", "email"],
      },
    ],
  })

  sendResponse(
    res,
    201,
    {
      event: eventWithCreator,
    },
    "Event created successfully",
  )
})

export const getAllEvents = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, category, location, startDate, endDate, minPrice, maxPrice, search } = req.query

  const offset = (page - 1) * limit
  const whereClause = { isActive: true }

  // Apply filters
  if (category) {
    whereClause.category = { [Op.iLike]: `%${category}%` }
  }

  if (location) {
    whereClause.location = { [Op.iLike]: `%${location}%` }
  }

  if (startDate || endDate) {
    whereClause.dateTime = {}
    if (startDate) {
      whereClause.dateTime[Op.gte] = new Date(startDate)
    }
    if (endDate) {
      whereClause.dateTime[Op.lte] = new Date(endDate)
    }
  }

  if (minPrice || maxPrice) {
    whereClause.price = {}
    if (minPrice) {
      whereClause.price[Op.gte] = Number.parseFloat(minPrice)
    }
    if (maxPrice) {
      whereClause.price[Op.lte] = Number.parseFloat(maxPrice)
    }
  }

  if (search) {
    whereClause[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }, { description: { [Op.iLike]: `%${search}%` } }]
  }

  const { count, rows: events } = await Event.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
    order: [["dateTime", "ASC"]],
    limit: Number.parseInt(limit),
    offset: Number.parseInt(offset),
  })

  const totalPages = Math.ceil(count / limit)

  sendResponse(
    res,
    200,
    {
      events,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalEvents: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    "Events retrieved successfully",
  )
})

export const getEventById = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const event = await Event.findOne({
    where: { id, isActive: true },
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Booking,
        as: "bookings",
        attributes: ["id", "numberOfTickets", "status"],
        where: { status: "confirmed" },
        required: false,
      },
    ],
  })

  if (!event) {
    return next(new AppError("Event not found", 404))
  }

  sendResponse(
    res,
    200,
    {
      event,
    },
    "Event retrieved successfully",
  )
})

export const updateEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const userId = req.user.id
  const userRole = req.user.role

  const event = await Event.findByPk(id)

  if (!event) {
    return next(new AppError("Event not found", 404))
  }

  // Check if user is the creator or admin
  if (event.createdBy !== userId && userRole !== "admin") {
    return next(new AppError("You can only update your own events", 403))
  }

  // Prevent updating total seats if there are confirmed bookings
  if (req.body.totalSeats) {
    const confirmedBookings = await Booking.count({
      where: { eventId: id, status: "confirmed" },
    })

    if (confirmedBookings > 0 && req.body.totalSeats < event.totalSeats) {
      return next(new AppError("Cannot reduce total seats when there are confirmed bookings", 400))
    }

    // Update available seats proportionally
    if (req.body.totalSeats !== event.totalSeats) {
      const bookedSeats = event.totalSeats - event.availableSeats
      req.body.availableSeats = req.body.totalSeats - bookedSeats
    }
  }

  await event.update(req.body)

  const updatedEvent = await Event.findByPk(id, {
    include: [
      {
        model: User,
        as: "creator",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
  })

  sendResponse(
    res,
    200,
    {
      event: updatedEvent,
    },
    "Event updated successfully",
  )
})

export const deleteEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const userId = req.user.id
  const userRole = req.user.role

  const event = await Event.findByPk(id)

  if (!event) {
    return next(new AppError("Event not found", 404))
  }

  // Check if user is the creator or admin
  if (event.createdBy !== userId && userRole !== "admin") {
    return next(new AppError("You can only delete your own events", 403))
  }

  // Check if there are confirmed bookings
  const confirmedBookings = await Booking.count({
    where: { eventId: id, status: "confirmed" },
  })

  if (confirmedBookings > 0) {
    return next(new AppError("Cannot delete event with confirmed bookings", 400))
  }

  // Soft delete by setting isActive to false
  await event.update({ isActive: false })

  sendResponse(res, 200, null, "Event deleted successfully")
})

export const getMyEvents = catchAsync(async (req, res) => {
  const userId = req.user.id
  const { page = 1, limit = 10 } = req.query
  const offset = (page - 1) * limit

  const { count, rows: events } = await Event.findAndCountAll({
    where: { createdBy: userId },
    include: [
      {
        model: Booking,
        as: "bookings",
        attributes: ["id", "numberOfTickets", "status"],
        where: { status: "confirmed" },
        required: false,
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
      events,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalEvents: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    "Your events retrieved successfully",
  )
})
