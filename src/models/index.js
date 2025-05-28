import User from "./user.model.js"
import Event from "./event.model.js"
import Booking from "./booking.model.js"

// Define associations
User.hasMany(Event, {
  foreignKey: "createdBy",
  as: "createdEvents",
})

Event.belongsTo(User, {
  foreignKey: "createdBy",
  as: "creator",
})

User.hasMany(Booking, {
  foreignKey: "userId",
  as: "bookings",
})

Booking.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
})

Event.hasMany(Booking, {
  foreignKey: "eventId",
  as: "bookings",
})

Booking.belongsTo(Event, {
  foreignKey: "eventId",
  as: "event",
})

export { User, Event, Booking }
