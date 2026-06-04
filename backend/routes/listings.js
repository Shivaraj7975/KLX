import express from 'express'
import mongoose from 'mongoose'
import Listing from '../models/Listing.js'
import ContactRequest from '../models/ContactRequest.js'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { buildSellerContactEmail, sendEmail } from '../utils/mailer.js'
import { verifyToken, verifyAdmin } from '../middleware/auth.js'

const router = express.Router()
const getAdminEmail = () => String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const isAdminEmail = (email) => String(email || '').trim().toLowerCase() === getAdminEmail()

const findListingByIdentifier = async (identifier) => {
  if (!identifier) {
    return null
  }

  const queries = [{ id: identifier }]

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    queries.push({ _id: identifier })
  }

  return Listing.findOne(queries.length === 1 ? queries[0] : { $or: queries })
}

const getOptionalAuthUser = async (req) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return await User.findById(decoded.id)
  } catch {
    return null
  }
}

const enrichListing = async (listing, includeContacts = false) => {
  const contacts = includeContacts ? await ContactRequest.find({ listingId: listing._id }).sort({ createdAt: -1 }) : []
  return {
    ...listing.toObject(),
    contactRequests: contacts,
  }
}

// @route   GET /api/listings
// @desc    Get all listings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({ active: true, availableQuantity: { $gt: 0 } }).sort({ createdAt: -1 })
    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/mine', verifyToken, async (req, res) => {
  try {
    const listings = await Listing.find({ sellerId: req.user.id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, listings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   GET /api/listings/:id
// @desc    Get listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await findListingByIdentifier(req.params.id)

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    const authUser = await getOptionalAuthUser(req)
    const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
    const includeContacts = Boolean(
      authUser &&
        (authUser._id.toString() === listing.sellerId.toString() || authUser.email?.toLowerCase() === adminEmail)
    )

    if (!listing.approved && !includeContacts) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    res.status(200).json({ success: true, listing: await enrichListing(listing, includeContacts) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   POST /api/listings
// @desc    Create new listing
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, category, condition, price, description, campus, imageUrl, videoUrl, availableQuantity } = req.body
    const nextQuantity = Number(availableQuantity)

    if (!name || !category || !condition || !price || Number.isNaN(nextQuantity) || nextQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields, including a quantity of at least 1',
      })
    }

    const seller = await User.findById(req.user.id)

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' })
    }

    if (seller.blocked || seller.blockedSell) {
      return res.status(403).json({ success: false, message: 'You are blocked from selling' })
    }

    const listing = await Listing.create({
      id: uuidv4(),
      sellerId: req.user.id,
      sellerName: seller.name,
      sellerPhone: seller.phone,
      sellerEmail: seller.email,
      sellerCampus: campus,
      sellerBlocked: seller.blocked,
      name,
      category,
      condition,
      price,
      availableQuantity: nextQuantity,
      description,
      campus,
      imageUrl,
      videoUrl,
      approved: true,
      approvalStatus: 'APPROVED',
      active: true,
    })

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   PUT /api/listings/:id
// @desc    Update listing
// @access  Private
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await findListingByIdentifier(req.params.id)

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    // Check if user is owner or admin
    if (listing.sellerId.toString() !== req.user.id && !isAdminEmail(req.user?.email)) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    listing.set(req.body)
    await listing.save()

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// @route   DELETE /api/listings/:id
// @desc    Delete listing
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const listing = await findListingByIdentifier(req.params.id)

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    // Check if user is owner or admin
    if (listing.sellerId.toString() !== req.user.id && !isAdminEmail(req.user?.email)) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    await listing.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/:id/contacts', verifyToken, async (req, res) => {
  try {
    const listing = await findListingByIdentifier(req.params.id)
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    if (listing.sellerId.toString() !== req.user.id && !isAdminEmail(req.user?.email)) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const contacts = await ContactRequest.find({ listingId: listing._id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, contacts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/:id/contact', verifyToken, async (req, res) => {
  try {
    const listing = await findListingByIdentifier(req.params.id)
    const buyer = await User.findById(req.user.id)

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    if (!buyer) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (buyer.blocked || buyer.blockedBuy) {
      return res.status(403).json({ success: false, message: 'You are blocked from contacting sellers' })
    }

    if (listing.sellerId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot contact your own listing' })
    }

    const contact = await ContactRequest.create({
      listingId: listing._id,
      buyerId: buyer._id,
      sellerId: listing.sellerId,
      buyerName: buyer.name,
      buyerPhone: buyer.phone,
      buyerEmail: buyer.email,
      note: req.body.note || '',
    })

    const seller = await User.findById(listing.sellerId)
    if (seller?.email) {
      await sendEmail({
        to: seller.email,
        ...buildSellerContactEmail({
          listingName: listing.name,
          buyerName: buyer.name,
          buyerPhone: buyer.phone,
          buyerEmail: buyer.email,
          note: req.body.note,
        }),
      })
    }

    res.status(201).json({ success: true, message: 'Seller notified successfully', contact })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/:id/deal-done', verifyToken, async (req, res) => {
  try {
    const listing = await findListingByIdentifier(req.params.id)
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    if (listing.sellerId.toString() !== req.user.id && !isAdminEmail(req.user?.email)) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    if (listing.availableQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'No quantity left to decrement' })
    }

    listing.availableQuantity -= 1
    if (listing.availableQuantity <= 0) {
      listing.availableQuantity = 0
      listing.active = false
    }
    await listing.save()

    if (req.body.contactId) {
      await ContactRequest.findByIdAndUpdate(req.body.contactId, {
        status: 'DEAL_DONE',
        dealDoneAt: new Date(),
      })
    }

    res.status(200).json({ success: true, message: 'Deal marked done', listing: await enrichListing(listing) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.patch('/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const listing = await findListingByIdentifier(req.params.id)
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    listing.approved = true
    listing.approvalStatus = 'APPROVED'
    listing.active = true
    await listing.save()

    res.status(200).json({ success: true, listing })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
