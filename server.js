import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import rateLimit from "express-rate-limit"
import dotenv from "dotenv"


import authRoutes from "./src/routes/auth.routes.js"
import eventRoutes from "./src/routes/event.routes.js"
import bookingRoutes from "./src/routes/booking.routes.js"
import userRoutes from "./src/routes/user.routes.js"


import { errorHandler } from "./src/middleware/error.middleware.js"
import { notFound } from "./src/middleware/notFound.middleware.js"

import { sequelize } from "./src/config/database.config.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)


app.use(morgan("combined"))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Event Booking API is running",
    timestamp: new Date().toISOString(),
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/users", userRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)


const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log("✅ Database connection established successfully.")
    console.log(`✅ Connected to: ${process.env.DB_HOST || process.env.DATABASE_URL?.split("@")[1]?.split("/")[0]}`)

    
    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true })
      console.log("✅ Database synchronized.")
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`)
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    console.error("❌ Unable to connect to the database:")
    console.error(error.message)
    console.error("Please check your database credentials and connection.")
    process.exit(1)
  }
}

startServer()

export default app
