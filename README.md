# Event Booking System API

A comprehensive RESTful API for an Event Booking System built with Node.js, Express, and PostgreSQL. This system allows users to browse events, book tickets, and manage their bookings with role-based access control.

## 🚀 Features

### User Management
- User registration and authentication with JWT
- Role-based access control (User/Admin)
- Profile management
- Password change functionality

### Event Management
- Create, read, update, and delete events (Admin only)
- Public event browsing (no authentication required)
- Event filtering and pagination
- Search functionality
- Image support for events

### Booking System
- Ticket booking for authenticated users
- View personal bookings
- Cancel bookings (with time restrictions)
- Seat availability management
- Booking history

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors, express-rate-limit
- **Development**: nodemon

## 📁 Project Structure

\`\`\`
src/
├── config/
│   └── database.config.js      # Database configuration
├── controllers/
│   ├── auth.controller.js      # Authentication logic
│   ├── event.controller.js     # Event management logic
│   ├── booking.controller.js   # Booking management logic
│   └── user.controller.js      # User management logic
├── middleware/
│   ├── auth.middleware.js      # Authentication middleware
│   ├── validation.middleware.js # Validation error handling
│   ├── error.middleware.js     # Global error handling
│   └── notFound.middleware.js  # 404 handler
├── models/
│   ├── user.model.js          # User model
│   ├── event.model.js         # Event model
│   ├── booking.model.js       # Booking model
│   └── index.js               # Model associations
├── routes/
│   ├── auth.routes.js         # Authentication routes
│   ├── event.routes.js        # Event routes
│   ├── booking.routes.js      # Booking routes
│   └── user.routes.js         # User management routes
├── utils/
│   ├── appError.util.js       # Custom error class
│   ├── catchAsync.util.js     # Async error wrapper
│   ├── jwt.util.js            # JWT utilities
│   └── response.util.js       # Response utilities
└── validators/
    ├── auth.validator.js      # Authentication validation
    ├── event.validator.js     # Event validation
    └── booking.validator.js   # Booking validation
\`\`\`

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd event-booking-api
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Update the \`.env\` file with your configuration:
   \`\`\`env
   NODE_ENV=development
   PORT=3000
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=event_booking_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_DIALECT=postgres
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   # Create database
   createdb event_booking_db
   
   # Run the application (it will sync the database automatically in development)
   npm run dev
   \`\`\`

5. **Start the server**
   \`\`\`bash
   # Development
   npm run dev
   
   # Production
   npm start
   \`\`\`

The API will be available at \`http://localhost:3000\`

## 📚 API Documentation

### Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

### Endpoints

#### Authentication (\`/api/auth\`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | \`/register\` | Register a new user | No |
| POST | \`/login\` | Login user | No |
| GET | \`/profile\` | Get user profile | Yes |
| PUT | \`/profile\` | Update user profile | Yes |
| PUT | \`/change-password\` | Change password | Yes |

#### Events (\`/api/events\`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | \`/\` | Get all | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all events (with filtering) | No | - |
| GET | `/:id` | Get event by ID | No | - |
| GET | `/my/events` | Get user's created events | Yes | User/Admin |
| POST | `/` | Create new event | Yes | Admin |
| PUT | `/:id` | Update event | Yes | Admin |
| DELETE | `/:id` | Delete event | Yes | Admin |

#### Bookings (`/api/bookings`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/` | Create booking | Yes | User/Admin |
| GET | `/my` | Get user's bookings | Yes | User/Admin |
| GET | `/:id` | Get booking by ID | Yes | User/Admin |
| PUT | `/:id/cancel` | Cancel booking | Yes | User/Admin |
| GET | `/` | Get all bookings | Yes | Admin |

#### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | Get all users | Yes | Admin |
| GET | `/:id` | Get user by ID | Yes | Admin |
| PUT | `/:id/role` | Update user role | Yes | Admin |
| PUT | `/:id/toggle-status` | Toggle user status | Yes | Admin |
| DELETE | `/:id` | Delete user | Yes | Admin |

### Request/Response Examples

#### Register User
\`\`\`bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123"
}
\`\`\`

#### Login
\`\`\`bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "Password123"
}
\`\`\`

#### Create Event
\`\`\`bash
POST /api/events
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference featuring latest trends",
  "dateTime": "2024-06-15T09:00:00Z",
  "location": "Convention Center, New York",
  "totalSeats": 500,
  "price": 99.99,
  "category": "Technology",
  "imageUrl": "https://example.com/image.jpg"
}
\`\`\`

#### Book Event
\`\`\`bash
POST /api/bookings
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "eventId": "event-uuid-here",
  "numberOfTickets": 2
}
\`\`\`

#### Get Events with Filters
\`\`\`bash
GET /api/events?page=1&limit=10&category=Technology&location=New York&minPrice=50&maxPrice=200
\`\`\`

### Response Format

All API responses follow this format:

**Success Response:**
\`\`\`json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": [
      // Additional error details if applicable
    ]
  }
}
\`\`\`

### Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Passwords are hashed using bcrypt with salt rounds
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: API calls are rate-limited to prevent abuse
- **CORS Protection**: Cross-origin requests are properly configured
- **Security Headers**: Helmet.js adds various security headers

## 🧪 Testing

Run the test suite:
\`\`\`bash
npm test
\`\`\`

## 🐳 Docker Support

Build and run with Docker:
\`\`\`bash
# Build image
docker build -t event-booking-api .

# Run container
docker run -p 3000:3000 --env-file .env event-booking-api
\`\`\`

## 📝 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `firstName` (String, Required)
- `lastName` (String, Required)
- `email` (String, Unique, Required)
- `password` (String, Hashed, Required)
- `role` (Enum: 'user', 'admin')
- `isActive` (Boolean)
- `lastLogin` (Date)
- `createdAt` (Date)
- `updatedAt` (Date)

### Events Table
- `id` (UUID, Primary Key)
- `title` (String, Required)
- `description` (Text, Required)
- `dateTime` (Date, Required)
- `location` (String, Required)
- `totalSeats` (Integer, Required)
- `availableSeats` (Integer, Required)
- `price` (Decimal, Required)
- `category` (String, Optional)
- `imageUrl` (String, Optional)
- `isActive` (Boolean)
- `createdBy` (UUID, Foreign Key)
- `createdAt` (Date)
- `updatedAt` (Date)

### Bookings Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `eventId` (UUID, Foreign Key)
- `numberOfTickets` (Integer, Required)
- `totalAmount` (Decimal, Required)
- `status` (Enum: 'confirmed', 'cancelled', 'pending')
- `bookingDate` (Date)
- `cancellationDate` (Date, Optional)
- `cancellationReason` (String, Optional)
- `createdAt` (Date)
- `updatedAt` (Date)

## 🚀 Deployment

### Environment Variables for Production
\`\`\`env
NODE_ENV=production
PORT=3000
DB_HOST=your_production_db_host
DB_NAME=your_production_db_name
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_super_secure_jwt_secret
\`\`\`

### Production Considerations
- Use environment variables for all sensitive data
- Enable database SSL in production
- Set up proper logging
- Configure monitoring and health checks
- Use a process manager like PM2
- Set up database migrations instead of sync

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

## 📋 TODO / Future Enhancements

- [ ] Email notifications for bookings
- [ ] Payment integration
- [ ] Event categories management
- [ ] Advanced search and filtering
- [ ] Event reviews and ratings
- [ ] Waitlist functionality
- [ ] Event reminders
- [ ] Analytics dashboard
- [ ] Mobile app API support
- [ ] Social media integration
\`\`\`

```dockerfile file="Dockerfile" type="code"
# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start the application
CMD ["npm", "start"]
