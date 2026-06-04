import mongoose from 'mongoose'

const listingSchema = new mongoose.Schema(
  {
    id: String,
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerName: String,
    sellerPhone: String,
    sellerEmail: String,
    sellerCampus: String,
    sellerBlocked: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: [true, 'Please provide product name'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Books', 'Electronics', 'Transport', 'Accessories', 'Academic'],
    },
    condition: {
      type: String,
      required: [true, 'Please select condition'],
      enum: ['Like New', 'Good', 'Fair', 'Used'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Please provide available quantity'],
      min: 0,
      default: 1,
    },
    description: String,
    campus: String,
    imageUrl: String,
    videoUrl: String,
    active: {
      type: Boolean,
      default: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Listing', listingSchema)
