import jwt from "jsonwebtoken"
import { User } from "../models/index.js"
import { AppError } from "../utils/appError.util.js"
import { catchAsync } from "../utils/catchAsync.util.js"

export const authenticate = catchAsync(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Access token is required", 401))
  }

  const token = authHeader.split(" ")[1]

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from database
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return next(new AppError("User no longer exists", 401))
    }

    if (!user.isActive) {
      return next(new AppError("User account is deactivated", 401))
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token", 401))
    } else if (error.name === "TokenExpiredError") {
      return next(new AppError("Token has expired", 401))
    }
    return next(new AppError("Authentication failed", 401))
  }
})

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403))
    }
    next()
  }
}

export const optionalAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findByPk(decoded.id)

      if (user && user.isActive) {
        req.user = user
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }

  next()
})
