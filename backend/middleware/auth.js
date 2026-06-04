import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const getAdminEmail = () => String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const isAdminEmail = (email) => String(email || '').trim().toLowerCase() === getAdminEmail()

const toAuthUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  phone: user.phone,
  email: user.email,
  role: isAdminEmail(user.email) ? 'ADMIN' : user.role,
  campus: user.campus,
  blocked: user.blocked,
  blockedSell: user.blockedSell,
  blockedBuy: user.blockedBuy,
  emailVerified: user.emailVerified,
})

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    req.user = toAuthUser(user)
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export const verifyAdmin = async (req, res, next) => {
  await verifyToken(req, res, () => {})

  if (res.headersSent) {
    return
  }

  if (isAdminEmail(req.user?.email)) {
    next()
    return
  }

  res.status(403).json({ success: false, message: 'Admin access required' })
}

export const loadAuthUser = async (userId) => User.findById(userId)
