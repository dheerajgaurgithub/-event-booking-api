import { User, Event, Booking } from "../models/index.js"
import { sendResponse } from "../utils/response.util.js"
import { catchAsync } from "../utils/catchAsync.util.js"
import { AppError } from "../utils/appError.util.js"
import { Op } from "sequelize" // Import Op from sequelize

export const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, role, isActive } = req.query
  const offset = (page - 1) * limit

  const whereClause = {}
  if (role) {
    whereClause.role = role
  }
  if (isActive !== undefined) {
    whereClause.isActive = isActive === "true"
  }

  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
    limit: Number.parseInt(limit),
    offset: Number.parseInt(offset),
  })

  const totalPages = Math.ceil(count / limit)

  sendResponse(
    res,
    200,
    {
      users,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalUsers: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
    "Users retrieved successfully",
  )
})

export const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const user = await User.findByPk(id, {
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Event,
        as: "createdEvents",
        attributes: ["id", "title", "dateTime", "totalSeats", "availableSeats"],
      },
      {
        model: Booking,
        as: "bookings",
        attributes: ["id", "numberOfTickets", "totalAmount", "status", "bookingDate"],
        include: [
          {
            model: Event,
            as: "event",
            attributes: ["id", "title", "dateTime"],
          },
        ],
      },
    ],
  })

  if (!user) {
    return next(new AppError("User not found", 404))
  }

  sendResponse(
    res,
    200,
    {
      user,
    },
    "User retrieved successfully",
  )
})

export const updateUserRole = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { role } = req.body

  if (!["user", "admin"].includes(role)) {
    return next(new AppError('Invalid role. Must be either "user" or "admin"', 400))
  }

  const user = await User.findByPk(id)
  if (!user) {
    return next(new AppError("User not found", 404))
  }

  await user.update({ role })

  sendResponse(
    res,
    200,
    {
      user,
    },
    "User role updated successfully",
  )
})

export const toggleUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const user = await User.findByPk(id)
  if (!user) {
    return next(new AppError("User not found", 404))
  }

  await user.update({ isActive: !user.isActive })

  sendResponse(
    res,
    200,
    {
      user,
    },
    `User ${user.isActive ? "activated" : "deactivated"} successfully`,
  )
})

export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params

  const user = await User.findByPk(id)
  if (!user) {
    return next(new AppError("User not found", 404))
  }

  // Check if user has active bookings
  const activeBookings = await Booking.count({
    where: { userId: id, status: "confirmed" },
  })

  if (activeBookings > 0) {
    return next(new AppError("Cannot delete user with active bookings", 400))
  }

  // Check if user has upcoming events
  const upcomingEvents = await Event.count({
    where: {
      createdBy: id,
      isActive: true,
      dateTime: { [Op.gt]: new Date() },
    },
  })

  if (upcomingEvents > 0) {
    return next(new AppError("Cannot delete user with upcoming events", 400))
  }

  await user.destroy()

  sendResponse(res, 200, null, "User deleted successfully")
})
