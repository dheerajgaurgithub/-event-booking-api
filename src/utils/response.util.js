export const sendResponse = (res, statusCode, data, message = "Success") => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export const sendError = (res, statusCode, message, details = null) => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
    },
  })
}
