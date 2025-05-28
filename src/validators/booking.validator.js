import { body } from "express-validator"

export const createBookingValidator = [
  body("eventId").notEmpty().withMessage("Event ID is required").isUUID().withMessage("Event ID must be a valid UUID"),

  body("numberOfTickets").isInt({ min: 1, max: 10 }).withMessage("Number of tickets must be between 1 and 10"),
]

export const cancelBookingValidator = [
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Cancellation reason must not exceed 500 characters"),
]
