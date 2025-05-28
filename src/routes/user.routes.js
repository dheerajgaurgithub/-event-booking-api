import express from "express"
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from "../controllers/user.controller.js"
import { authenticate, authorize } from "../middleware/auth.middleware.js"
import { handleValidationErrors } from "../middleware/validation.middleware.js"
import { body } from "express-validator"

const router = express.Router()

// All routes require authentication and admin role
router.use(authenticate, authorize("admin"))

router.get("/", getAllUsers)
router.get("/:id", getUserById)
router.put(
  "/:id/role",
  [body("role").isIn(["user", "admin"]).withMessage("Role must be either user or admin")],
  handleValidationErrors,
  updateUserRole,
)
router.put("/:id/toggle-status", toggleUserStatus)
router.delete("/:id", deleteUser)

export default router
