import mongoose from 'mongoose'

const contactRequestSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerPhone: {
      type: String,
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['OPEN', 'DEAL_DONE'],
      default: 'OPEN',
    },
    dealDoneAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

export default mongoose.model('ContactRequest', contactRequestSchema)