import { User } from "../models/index.js"
import { generateToken } from "../utils/jwt.util.js"
import { sendResponse } from "../utils/response.util.js"
import { catchAsync } from "../utils/catchAsync.util.js"
import { AppError } from "../utils/appError.util.js"

export const register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } })
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400))
  }

  // Create new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  })

  // Generate JWT token
  const token = generateToken({ id: user.id, email: user.email })

  sendResponse(
    res,
    201,
    {
      user,
      token,
    },
    "User registered successfully",
  )
})

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // Find user by email
  const user = await User.findOne({
    where: { email },
    attributes: ["id", "firstName", "lastName", "email", "password", "role", "isActive"],
  })

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401))
  }

  if (!user.isActive) {
    return next(new AppError("Account is deactivated", 401))
  }

  // Update last login
  await user.update({ lastLogin: new Date() })

  // Generate JWT token
  const token = generateToken({ id: user.id, email: user.email })

  // Remove password from response
  const userResponse = user.toJSON()

  sendResponse(
    res,
    200,
    {
      user: userResponse,
      token,
    },
    "Login successful",
  )
})

export const getProfile = catchAsync(async (req, res) => {
  sendResponse(
    res,
    200,
    {
      user: req.user,
    },
    "Profile retrieved successfully",
  )
})

export const updateProfile = catchAsync(async (req, res, next) => {
  const { firstName, lastName } = req.body
  const userId = req.user.id

  const user = await User.findByPk(userId)
  if (!user) {
    return next(new AppError("User not found", 404))
  }

  await user.update({
    firstName: firstName || user.firstName,
    lastName: lastName || user.lastName,
  })

  sendResponse(
    res,
    200,
    {
      user,
    },
    "Profile updated successfully",
  )
})

export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body
  const userId = req.user.id

  const user = await User.findByPk(userId, {
    attributes: ["id", "password"],
  })

  if (!user || !(await user.comparePassword(currentPassword))) {
    return next(new AppError("Current password is incorrect", 400))
  }

  await user.update({ password: newPassword })

  sendResponse(res, 200, null, "Password changed successfully")
})
