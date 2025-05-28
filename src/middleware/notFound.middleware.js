import { AppError } from "../utils/appError.util.js"

export const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`
  next(new AppError(message, 404))
}
