import { body, query } from "express-validator"

export const createEventValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("dateTime")
    .isISO8601()
    .withMessage("Please provide a valid date and time")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Event date must be in the future")
      }
      return true
    }),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Location must be between 5 and 200 characters"),

  body("totalSeats").isInt({ min: 1, max: 100000 }).withMessage("Total seats must be between 1 and 100,000"),

  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("category").optional().trim().isLength({ max: 50 }).withMessage("Category must not exceed 50 characters"),

  body("imageUrl").optional().isURL().withMessage("Please provide a valid image URL"),
]

export const updateEventValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("dateTime")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date and time")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Event date must be in the future")
      }
      return true
    }),

  body("location")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Location must be between 5 and 200 characters"),

  body("totalSeats").optional().isInt({ min: 1, max: 100000 }).withMessage("Total seats must be between 1 and 100,000"),

  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),

  body("category").optional().trim().isLength({ max: 50 }).withMessage("Category must not exceed 50 characters"),

  body("imageUrl").optional().isURL().withMessage("Please provide a valid image URL"),
]

export const eventQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),

  query("category")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Category filter must not exceed 50 characters"),

  query("location")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location filter must not exceed 200 characters"),

  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),

  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),

  query("minPrice").optional().isFloat({ min: 0 }).withMessage("Minimum price must be a positive number"),

  query("maxPrice").optional().isFloat({ min: 0 }).withMessage("Maximum price must be a positive number"),
]
