import express from "express"
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
} from "../controllers/event.controller.js"
import { authenticate, authorize, optionalAuth } from "../middleware/auth.middleware.js"
import { handleValidationErrors } from "../middleware/validation.middleware.js"
import { createEventValidator, updateEventValidator, eventQueryValidator } from "../validators/event.validator.js"

const router = express.Router()

// Public routes
router.get("/", eventQueryValidator, handleValidationErrors, optionalAuth, getAllEvents)
router.get("/:id", getEventById)

// Protected routes
router.use(authenticate)

// User routes
router.get("/my/events", getMyEvents)

// Admin routes
router.post("/", authorize("admin"), createEventValidator, handleValidationErrors, createEvent)
router.put("/:id", authorize("admin"), updateEventValidator, handleValidationErrors, updateEvent)
router.delete("/:id", authorize("admin"), deleteEvent)

export default router
