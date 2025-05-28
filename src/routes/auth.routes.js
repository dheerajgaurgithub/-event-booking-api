import express from "express"
import { register, login, getProfile, updateProfile, changePassword } from "../controllers/auth.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"
import { handleValidationErrors } from "../middleware/validation.middleware.js"
import { registerValidator, loginValidator } from "../validators/auth.validator.js"
import { body } from "express-validator"

const router = express.Router()

// Public routes
router.post("/register", registerValidator, handleValidationErrors, register)
router.post("/login", loginValidator, handleValidationErrors, login)

// Protected routes
router.use(authenticate)

router.get("/profile", getProfile)
router.put(
  "/profile",
  [
    body("firstName").optional().trim().isLength({ min: 2, max: 50 }),
    body("lastName").optional().trim().isLength({ min: 2, max: 50 }),
  ],
  handleValidationErrors,
  updateProfile,
)

router.put(
  "/change-password",
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
  ],
  handleValidationErrors,
  changePassword,
)

export default router
