import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

// Check if we have a connection string or individual params
const connectionString = process.env.DATABASE_URL || null

export const sequelize = connectionString
  ? new Sequelize(connectionString, {
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // For self-signed certificates
        },
      },
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
    })
  : new Sequelize({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "event_booking_db",
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "password",
      dialect: process.env.DB_DIALECT || "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // For self-signed certificates
        },
      },
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
    })

export default sequelize
