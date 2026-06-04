# Backend Setup

This backend uses Node.js, Express.js, and MongoDB to handle the CLG Project API.

## Installation

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Environment Setup

The `.env` file is already configured with MongoDB connection:
```env
MONGODB_URI=mongodb+srv://01fe24bcs100_db_user:GTcOg9spgjXB8pxT@cluster0.b25f1i5.mongodb.net/?appName=Cluster0
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here_change_in_production
ADMIN_EMAIL=admin@yourdomain.com
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-smtp-login
BREVO_SMTP_PASS=your-brevo-smtp-password
BREVO_FROM_EMAIL=no-reply@yourdomain.com
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send email OTP for sign up
- `POST /api/auth/verify-otp` - Verify OTP and create account
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/profile` - Get user profile (requires token)

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/mine` - Get current seller listings
- `GET /api/listings/:id` - Get listing by ID
- `POST /api/listings` - Create listing (requires auth)
- `PUT /api/listings/:id` - Update listing (owner only)
- `DELETE /api/listings/:id` - Delete listing (owner only)
- `GET /api/listings/:id/contacts` - Get buyer contact requests for your listing
- `POST /api/listings/:id/contact` - Notify seller about interest in a listing
- `POST /api/listings/:id/deal-done` - Decrease quantity after a completed deal
- `PATCH /api/listings/:id/approve` - Approve a listing for public visibility (admin)

### Admin
- `GET /api/admin/users` - List users (admin)
- `PATCH /api/admin/users/:id/block` - Block or unblock a user
- `PATCH /api/admin/users/:id/block-sell` - Block or unblock selling for a user
- `PATCH /api/admin/users/:id/block-buy` - Block or unblock buying for a user
- `PATCH /api/admin/users/:id/role` - Update a user role
- `GET /api/admin/listings` - List all listings (admin)
- `PATCH /api/admin/listings/:id/approve` - Approve or unapprove a listing
- `DELETE /api/admin/listings/:id` - Delete a listing

### Requests
- `GET /api/requests` - Get all requests
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create request (requires auth)
- `POST /api/requests/:id/respond` - Add response to request (seller)
- `DELETE /api/requests/:id` - Delete request (requester only)

## Project Structure

```
backend/
├── models/           # MongoDB schemas (User, Listing, Request)
├── routes/           # API route handlers
├── middleware/       # Auth middleware
├── server.js         # Express server entry point
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
└── package.json      # Dependencies and scripts
```

## Database Models

### User
- name, phone (unique), email (unique), password
- role (STUDENT/ADMIN), campus, emailVerified
- blocked, blockedSell, blockedBuy flags
- timestamps

### Listing
- sellerId, name, category, condition, price, availableQuantity
- description, campus
- imageUrl, videoUrl
- active, approved, approvalStatus, timestamps

### OTP Code
- email, phone, name, OTP hash, expiration, used flag

### Contact Request
- listingId, buyerId, sellerId, buyerName, buyerPhone, buyerEmail
- note, status, dealDoneAt, timestamps

### Request
- requesterId, name, category, budget
- description, campus
- responses array (seller responses)
- active status, timestamps

## Notes

- All passwords are hashed with bcryptjs
- JWT tokens expire in 30 days
- Phone must be 10 digits
- Category must be one of: Books, Electronics, Transport, Accessories, Academic
- Condition must be one of: Like New, Good, Fair, Used
- OTP is only used during sign up; login is password-based
- Only the email in `ADMIN_EMAIL` should have admin access
- Use `node scripts/reset-database.js` to wipe users, listings, requests, OTPs, and contact requests
