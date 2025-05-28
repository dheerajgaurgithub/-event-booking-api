import express from "express"
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
} from "../controllers/booking.controller.js"
import { authenticate, authorize } from "../middleware/auth.middleware.js"
import { handleValidationErrors } from "../middleware/validation.middleware.js"
import { createBookingValidator, cancelBookingValidator } from "../validators/booking.validator.js"

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// User routes
router.post("/", createBookingValidator, handleValidationErrors, createBooking)
router.get("/my", getMyBookings)
router.get("/:id", getBookingById)
router.put("/:id/cancel", cancelBookingValidator, handleValidationErrors, cancelBooking)

// Admin routes
router.get("/", authorize("admin"), getAllBookings)

export default router
