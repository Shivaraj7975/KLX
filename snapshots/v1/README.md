# CLG Project - Full Stack Setup

This project is organized into two main folders:

- **frontend/** - React + Vite application
- **backend/** - Node.js + Express.js + MongoDB API

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Project Structure

```
clg_project/
├── frontend/              # React Vite app
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/              # Express.js API
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md             # This file
```

## Environment

**Frontend:**
- React 18
- React Router v6
- Vite v7.3.1

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Features

✅ Email OTP authentication with phone + email
✅ Product Listings (Create, Read, Update, Delete)
✅ Listing approval, contact logging, and quantity tracking
✅ Admin moderation for listings and users
✅ Product Requests (Create, Browse, Respond)
✅ Seller Edit Capability
✅ Auto-category Detection
✅ Video Support in Listings
✅ Mobile Responsive Design
✅ JWT Token-based Auth

## MongoDB Connection

Connected to: `mongodb+srv://01fe24bcs100_db_user:GTcOg9spgjXB8pxT@cluster0.b25f1i5.mongodb.net/?appName=Cluster0`

Collections:
- users
- listings
- requests

## Running Both Together

### Option 1: Terminal Tabs
- Tab 1: `cd frontend && npm run dev` (runs on :5173)
- Tab 2: `cd backend && npm run dev` (runs on :5000)

### Option 2: Concurrently
From root directory:
```bash
npm run dev
```

(Install `concurrently` and add script to root package.json)

## Notes

- Backend must be running before making API calls from frontend
- Update frontend API base URL to match backend URL if changed
- Configure Brevo SMTP variables in `backend/.env` to enable OTP and seller emails
- MongoDB connection is pre-configured
- Change JWT_SECRET in production
- Ensure both frontend and backend are on different ports
- Reset the database with `cd backend && node scripts/reset-database.js`
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
