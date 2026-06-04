# CLG Project - Backend Setup Complete ✅

## What Was Created

### Backend Structure
```
backend/
├── models/
│   ├── User.js          # User schema with auth
│   ├── Listing.js       # Product listing schema
│   └── Request.js       # Product request schema
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── listings.js      # Listing CRUD routes
│   └── requests.js      # Request CRUD routes
├── middleware/
│   └── auth.js          # JWT verification middleware
├── server.js            # Express server entry point
├── package.json         # Backend dependencies
├── .env                 # MongoDB connection + JWT secret
├── .gitignore
└── README.md            # Backend documentation
```

### Backend Features
- ✅ Express.js server
- ✅ MongoDB connection (pre-configured)
- ✅ Email OTP authentication with phone + email
- ✅ JWT token-based auth
- ✅ Product listings API with approval and quantity tracking
- ✅ Product requests API
- ✅ Password hashing with bcryptjs
- ✅ CORS enabled
- ✅ Error handling

## Fresh Database Reset

To wipe all current users, listings, requests, OTP codes, and contact requests:

```bash
cd backend
node scripts/reset-database.js
```

After that, create a new account through the sign-up page. If `ADMIN_EMAIL` is set in `backend/.env`, that account becomes the admin.

Login now uses email and password. OTP is only used during sign up.

---

## Next Steps: Organize Frontend & Backend

### Step 1: Create Frontend Folder
You have two options:

**Option A: Manual Move (Recommended)**
1. Create a `frontend` folder in the root directory
2. Move these files/folders INTO `frontend/`:
   ```
   src/
   public/
   index.html
   vite.config.js
   eslint.config.js
   package.json (the current one)
   package-lock.json
   abc.html
   .gitignore
   dist/
   ```
3. Keep `node_modules` where it is or reinstall in frontend

**Option B: Automation Script**
Run this in PowerShell from `clg_project` root:
```powershell
# Create frontend folder
mkdir frontend -Force

# Copy frontend files
Copy-Item -Path "src", "public", "index.html", "vite.config.js", "eslint.config.js" -Destination "frontend" -Recurse -Force
Copy-Item -Path "package.json.original" -Destination "frontend/package.json" -Force  # If you have original

# Move node_modules (or reinstall)
Move-Item -Path "node_modules" -Destination "frontend" -Force
```

### Step 2: Create Frontend package.json
If frontend doesn't have its own `package.json`, create one:
```bash
cd frontend
npm init -y
npm install react react-dom react-router-dom leaflet react-leaflet vite @vitejs/plugin-react
```

---

## Installation & Running

### Install All Dependencies
```bash
# From root directory
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Run Development Servers

**Option 1: Both at Once (from root)**
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

**Option 2: Separate Terminals**

Terminal 1 - Frontend:
```bash
npm run dev:frontend
```

Terminal 2 - Backend:
```bash
npm run dev:backend
```

---

## Environment Configuration

### Backend (.env) - Already Set
```
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

### Frontend - Update API Base URL
Update your frontend API service to point to backend:

In `src/services/api.js` or wherever you make API calls:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
```

Or in your fetch calls:
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
```

---

## MongoDB Collections

The following collections will be automatically created:

### 1. **users**
```javascript
{
  name: String,
  phone: String (unique, 10 digits),
  email: String (unique),
  password: String (hashed),
  role: 'STUDENT' | 'ADMIN',
  campus: String,
  profileImage: String,
  blocked: Boolean,
  blockedSell: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **listings**
```javascript
{
  id: UUID,
  sellerId: ObjectId (User),
  name: String,
  category: 'Books' | 'Electronics' | 'Transport' | 'Accessories' | 'Academic',
  condition: 'Like New' | 'Good' | 'Fair' | 'Used',
  price: Number,
  description: String,
  campus: String,
  imageUrl: String,
  videoUrl: String,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. **requests**
```javascript
{
  id: UUID,
  requesterId: ObjectId (User),
  name: String,
  category: 'Books' | 'Electronics' | 'Transport' | 'Accessories' | 'Academic',
  budget: Number,
  description: String,
  campus: String,
  responses: [{
    sellerId: ObjectId,
    message: String,
    price: Number,
    respondedAt: Date
  }],
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Quick Reference

### Authentication
```bash
The login flow now uses `POST /api/auth/send-otp` followed by `POST /api/auth/verify-otp`.
```

### Listings
```bash
# Get all listings
GET http://localhost:5000/api/listings

# Create listing (requires auth)
POST http://localhost:5000/api/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "iPhone 14",
  "category": "Electronics",
  "condition": "Good",
  "price": 25000,
  "description": "Barely used",
  "campus": "KLE",
  "imageUrl": "...",
  "videoUrl": "..."
}

# Update listing (owner only)
PUT http://localhost:5000/api/listings/:id
Authorization: Bearer <token>

# Delete listing (owner only)
DELETE http://localhost:5000/api/listings/:id
Authorization: Bearer <token>
```

### Requests
```bash
# Get all requests
GET http://localhost:5000/api/requests

# Create request (requires auth)
POST http://localhost:5000/api/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Python Book",
  "category": "Books",
  "budget": 500,
  "description": "Need latest edition",
  "campus": "KLE"
}

# Respond to request (seller)
POST http://localhost:5000/api/requests/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I have this book",
  "price": 450
}
```

---

## Troubleshooting

### Backend won't start
```bash
cd backend
npm install
npm run dev
```

### MongoDB Connection Error
- Check `.env` file has correct connection string
- Ensure network access is allowed in MongoDB Atlas
- Verify internet connection

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check CORS is enabled (it is by default)
- Verify API URL in frontend matches backend address

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

---

## Project Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Port 5173)            │
│  React 18 + React Router + Vite         │
└──────────────┬──────────────────────────┘
               │ HTTP Requests
               ▼
┌─────────────────────────────────────────┐
│         Backend (Port 5000)             │
│  Express.js + Node.js                   │
│  ┌───────────────────────────────────┐  │
│  │  Routes                           │  │
│  │  - /api/auth                      │  │
│  │  - /api/listings                  │  │
│  │  - /api/requests                  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Models (Mongoose)                │  │
│  │  - User                           │  │
│  │  - Listing                        │  │
│  │  - Request                        │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │ Database Operations
               ▼
┌─────────────────────────────────────────┐
│    MongoDB Atlas (Cloud Database)       │
│    - users collection                   │
│    - listings collection                │
│    - requests collection                │
└─────────────────────────────────────────┘
```

---

## Next: Connect Frontend to Backend

Once backend is running, update your frontend API calls to use the backend endpoints instead of mock data.

Example migration from mock to real API:

**Before (Mock):**
```javascript
// src/services/api.js (mock)
export const getListings = async () => {
  return mockData.listings
}
```

**After (Real Backend):**
```javascript
// src/services/api.js (real)
const API_URL = 'http://localhost:5000/api'

export const getListings = async (token) => {
  const response = await fetch(`${API_URL}/listings`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.json()
}

export const createListing = async (data, token) => {
  const response = await fetch(`${API_URL}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return response.json()
}
```

---

## Summary

✅ Backend created with Express + MongoDB
✅ Authentication system ready
✅ Listings API ready
✅ Requests API ready  
✅ MongoDB connection configured
✅ JWT authentication implemented
✅ Ready for frontend integration

**Next Action:** 
1. Organize frontend into its own folder
2. Update frontend to use backend APIs
3. Test full-stack integration
