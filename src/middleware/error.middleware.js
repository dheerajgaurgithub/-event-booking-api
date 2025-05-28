import { AppError } from "../utils/appError.util.js"

export const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error
  console.error(err)

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const message = err.errors.map((error) => error.message).join(", ")
    error = new AppError(message, 400)
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    const message = "Duplicate field value entered"
    error = new AppError(message, 400)
  }

  // Sequelize foreign key constraint error
  if (err.name === "SequelizeForeignKeyConstraintError") {
    const message = "Invalid reference to related resource"
    error = new AppError(message, 400)
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token"
    error = new AppError(message, 401)
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired"
    error = new AppError(message, 401)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || "Server Error",
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  })
}
