import dotenv from 'dotenv'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Listing from '../models/Listing.js'
import Request from '../models/Request.js'
import OtpCode from '../models/OtpCode.js'
import ContactRequest from '../models/ContactRequest.js'

dotenv.config()

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing')
  }

  await mongoose.connect(process.env.MONGODB_URI)

  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Request.deleteMany({}),
    OtpCode.deleteMany({}),
    ContactRequest.deleteMany({}),
  ])

  console.log('Database cleared: users, listings, requests, OTP codes, and contact requests removed.')
  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error(error)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})