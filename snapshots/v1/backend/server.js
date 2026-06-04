import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI
const PORT = process.env.PORT || 5000

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message)
    process.exit(1)
  })

// Basic Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date() })
})

// Routes
import authRoutes from './routes/auth.js'
import listingRoutes from './routes/listings.js'
import requestRoutes from './routes/requests.js'
import adminRoutes from './routes/admin.js'

app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/admin', adminRoutes)

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  })
})

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ Port ${PORT} is already in use.`)
    console.error('Stop the existing process or set a different PORT in backend/.env.')
    process.exit(1)
  }

  console.error('✗ Server startup error:', err.message)
  process.exit(1)
})
