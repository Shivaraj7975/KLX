import express from 'express'
import User from '../models/User.js'
import OtpCode from '../models/OtpCode.js'
import bcryptjs from 'bcryptjs'
import crypto from 'crypto'
import { buildOtpEmail, sendEmail } from '../utils/mailer.js'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

const toUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  campus: user.campus,
  blocked: user.blocked,
  blockedSell: user.blockedSell,
  blockedBuy: user.blockedBuy,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
})

const isAdminEmail = (email) => {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL)
  return adminEmail && adminEmail === normalizeEmail(email)
}

// @route   POST /api/auth/send-otp
// @desc    Send email OTP for sign up
// @access  Public
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, email, name, password } = req.body

    if (!phone || !email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide phone, email, name, and password',
      })
    }

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number',
      })
    }

    const normalizedEmail = normalizeEmail(email)
    const existingUser = await User.findOne({ $or: [{ phone }, { email: normalizedEmail }] })

    if (existingUser?.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account already exists for this email or phone number.',
      })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const otpHash = await bcryptjs.hash(otp, 10)

    await OtpCode.deleteMany({ email: normalizedEmail, phone })
    await OtpCode.create({
      email: normalizedEmail,
      phone,
      name,
      otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })

    const mailResult = await sendEmail({
      to: normalizedEmail,
      ...buildOtpEmail({ name, otp }),
    })

    if (mailResult?.skipped) {
      return res.status(500).json({
        success: false,
        message: 'SMTP is not configured. Set Brevo SMTP values in backend/.env first.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address for sign up',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
})

// @route   POST /api/auth/verify-otp
// @desc    Verify email OTP and create account
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, email, name, otp, password, campus } = req.body

    if (!phone || !email || !name || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Please provide phone, email, name, password, and OTP' })
    }

    const normalizedEmail = normalizeEmail(email)
    const otpEntry = await OtpCode.findOne({ email: normalizedEmail, phone, used: false }).sort({ createdAt: -1 })

    if (!otpEntry) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' })
    }

    if (otpEntry.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' })
    }

    const isValidOtp = await bcryptjs.compare(String(otp), otpEntry.otpHash)
    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' })
    }

    otpEntry.used = true
    await otpEntry.save()

    let user = await User.findOne({ $or: [{ phone }, { email: normalizedEmail }] })

    if (user?.blocked) {
      return res.status(403).json({ success: false, message: 'This account is blocked' })
    }

    if (!user) {
      user = new User({
        name,
        phone,
        email: normalizedEmail,
        password,
        role: isAdminEmail(normalizedEmail) ? 'ADMIN' : 'STUDENT',
        campus: campus || '',
        emailVerified: true,
      })
    } else {
      user.name = name || user.name
      user.email = normalizedEmail
      user.phone = phone
      user.password = password
      user.campus = campus || user.campus
      user.emailVerified = true
      user.role = isAdminEmail(normalizedEmail) ? 'ADMIN' : 'STUDENT'
    }

    await user.save()

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      token,
      user: toUserResponse(user),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   POST /api/auth/login
// @desc    Login with email and password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' })
    }

    const normalizedEmail = normalizeEmail(email)
    const user = await User.findOne({ email: normalizedEmail }).select('+password')

    if (!user) {
      return res.status(400).json({ success: false, message: 'Account not found. Please sign up first.' })
    }

    if (user.blocked) {
      return res.status(403).json({ success: false, message: 'This account is blocked' })
    }

    const isValidPassword = await bcryptjs.compare(String(password), user.password)
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' })
    }

    user.role = isAdminEmail(user.email) ? 'ADMIN' : 'STUDENT'
    await user.save()

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      token,
      user: toUserResponse(user),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    res.status(200).json({
      success: true,
      user: toUserResponse(user),
    })
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

export default router
