import express from 'express'
import Listing from '../models/Listing.js'
import User from '../models/User.js'
import { verifyAdmin } from '../middleware/auth.js'

const router = express.Router()

router.use(verifyAdmin)

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    res.json({ success: true, users })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.patch('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.blocked = Boolean(req.body.blocked)
    await user.save()

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.patch('/users/:id/block-sell', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.blockedSell = Boolean(req.body.blockedSell)
    await user.save()

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.patch('/users/:id/block-buy', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.blockedBuy = Boolean(req.body.blockedBuy)
    await user.save()

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.patch('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.role = req.body.role || user.role
    await user.save()

    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/listings', async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 })
    res.json({ success: true, listings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.patch('/listings/:id/approve', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    listing.approved = Boolean(req.body.approved)
    listing.approvalStatus = listing.approved ? 'APPROVED' : 'PENDING'
    listing.active = listing.approved
    await listing.save()

    res.json({ success: true, listing })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.delete('/listings/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id)
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    res.json({ success: true, message: 'Listing deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router