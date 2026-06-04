import nodemailer from 'nodemailer'

const hasMailerConfig = () =>
  Boolean(
    process.env.BREVO_SMTP_HOST &&
      process.env.BREVO_SMTP_PORT &&
      process.env.BREVO_SMTP_USER &&
      process.env.BREVO_SMTP_PASS &&
      process.env.BREVO_FROM_EMAIL
  )

const createTransporter = () => {
  if (!hasMailerConfig()) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT || 587),
    secure: Number(process.env.BREVO_SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  })
}

export const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransporter()

  if (!transporter) {
    console.log('[mailer] Missing Brevo SMTP config, skipping email:', { to, subject })
    return { skipped: true }
  }

  return transporter.sendMail({
    from: process.env.BREVO_FROM_EMAIL,
    to,
    subject,
    text,
    html,
  })
}

export const buildOtpEmail = ({ name, otp }) => ({
  subject: 'Your KLX login OTP',
  text: `Hi ${name},\n\nYour verification code is ${otp}. It will expire in 10 minutes.\n\nIf you did not request this code, ignore this email.`,
  html: `<p>Hi <strong>${name}</strong>,</p><p>Your verification code is <strong>${otp}</strong>. It will expire in 10 minutes.</p><p>If you did not request this code, ignore this email.</p>`,
})

export const buildSellerContactEmail = ({ listingName, buyerName, buyerPhone, buyerEmail, note }) => ({
  subject: `New contact request for ${listingName}`,
  text: `A buyer contacted you about ${listingName}.\n\nBuyer: ${buyerName}\nPhone: ${buyerPhone}\nEmail: ${buyerEmail}\n\nNote: ${note || 'No message provided'}\n\nWhen the deal is done, open the listing and mark it as deal done so inventory decreases by 1.`,
  html: `<p>A buyer contacted you about <strong>${listingName}</strong>.</p><p><strong>Buyer:</strong> ${buyerName}<br /><strong>Phone:</strong> ${buyerPhone}<br /><strong>Email:</strong> ${buyerEmail}</p><p><strong>Note:</strong> ${note || 'No message provided'}</p><p>When the deal is done, open the listing and mark it as deal done so inventory decreases by 1.</p>`,
})