import express from 'express'
import Request from '../models/Request.js'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()
const getAdminEmail = () => String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const isAdminEmail = (email) => String(email || '').trim().toLowerCase() === getAdminEmail()

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

// @route   GET /api/requests
// @desc    Get all requests
// @access  Public
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find({ active: true }).sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   GET /api/requests/:id
// @desc    Get request by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' })
    }

    res.status(200).json({ success: true, request })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   POST /api/requests
// @desc    Create new request
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, category, budget, description, campus } = req.body

    if (!name || !category || !budget) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      })
    }

    const request = await Request.create({
      id: uuidv4(),
      requesterId: req.user.id,
      requesterName: req.body.requesterName,
      requesterPhone: req.body.requesterPhone,
      requesterEmail: req.body.requesterEmail,
      requesterCampus: campus,
      name,
      category,
      budget,
      description,
      campus,
    })

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      request,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   POST /api/requests/:id/respond
// @desc    Add response to request
// @access  Private
router.post('/:id/respond', verifyToken, async (req, res) => {
  try {
    const { message, price } = req.body

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          responses: {
            sellerId: req.user.id,
            sellerName: req.body.sellerName,
            sellerPhone: req.body.sellerPhone,
            sellerEmail: req.body.sellerEmail,
            message,
            price,
          },
        },
      },
      { new: true }
    )

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      request,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   DELETE /api/requests/:id
// @desc    Delete request
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' })
    }

    // Check if user is requester or admin
    if (request.requesterId.toString() !== req.user.id && !isAdminEmail(req.user?.email)) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    await Request.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Request deleted successfully',
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
