import mongoose from 'mongoose'

const requestSchema = new mongoose.Schema(
  {
    id: String,
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterName: String,
    requesterPhone: String,
    requesterEmail: String,
    requesterCampus: String,
    name: {
      type: String,
      required: [true, 'Please provide item name'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Books', 'Electronics', 'Transport', 'Accessories', 'Academic'],
    },
    budget: {
      type: Number,
      required: [true, 'Please provide budget'],
    },
    description: String,
    campus: String,
    responses: [
      {
        sellerId: mongoose.Schema.Types.ObjectId,
        sellerName: String,
        sellerPhone: String,
        sellerEmail: String,
        message: String,
        price: Number,
        respondedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    sellerResponsesNotified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

export default mongoose.model('Request', requestSchema)

