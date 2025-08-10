import { supabase } from "./supabase"

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

const emailTemplates: Record<string, (data: any) => EmailTemplate> = {
  welcome: (data) => ({
    subject: "Welcome to BulaRent!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BulaRent!</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0;">Fiji's Premier Property Rental Platform</p>
        </div>
        <div style="padding: 40px; background: white;">
          <h2 style="color: #1f2937;">Bula ${data.name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining BulaRent, Fiji's first dedicated property rental platform. 
            We're excited to help you find your perfect home in paradise!
          </p>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">Get Started:</h3>
            <ul style="color: #4b5563;">
              <li>Complete your profile to build trust</li>
              <li>Browse thousands of verified properties</li>
              <li>Connect directly with landlords</li>
              <li>Leave reviews to help the community</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/properties" 
               style="background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Browsing Properties
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Need help? Contact our support team at support@bularent.fj
          </p>
        </div>
        <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>© 2024 BulaRent. Made with 💙 in Fiji.</p>
        </div>
      </div>
    `,
    text: `Welcome to BulaRent, ${data.name}! Thank you for joining Fiji's premier property rental platform. Start browsing properties at ${process.env.NEXT_PUBLIC_APP_URL}/properties`,
  }),

  propertyApproved: (data) => ({
    subject: "Your Property Has Been Approved!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Property Approved! 🎉</h1>
        </div>
        <div style="padding: 40px; background: white;">
          <h2 style="color: #1f2937;">Great news, ${data.landlordName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your property "<strong>${data.propertyTitle}</strong>" has been approved and is now live on BulaRent!
          </p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #065f46; margin-top: 0;">What's Next:</h3>
            <ul style="color: #4b5563;">
              <li>Your property is now visible to thousands of potential tenants</li>
              <li>Respond promptly to inquiries to increase bookings</li>
              <li>Consider upgrading to featured listing for more visibility</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/properties/${data.propertyId}" 
               style="background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Property
            </a>
          </div>
        </div>
      </div>
    `,
    text: `Great news! Your property "${data.propertyTitle}" has been approved and is now live on BulaRent. View it at ${process.env.NEXT_PUBLIC_APP_URL}/properties/${data.propertyId}`,
  }),

  newInquiry: (data) => ({
    subject: "New Inquiry for Your Property",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Property Inquiry! 📩</h1>
        </div>
        <div style="padding: 40px; background: white;">
          <h2 style="color: #1f2937;">Hello ${data.landlordName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            You have received a new inquiry for your property "<strong>${data.propertyTitle}</strong>".
          </p>
          <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #6b21a8; margin-top: 0;">Inquiry Details:</h3>
            <p><strong>From:</strong> ${data.tenantName}</p>
            <p><strong>Email:</strong> ${data.tenantEmail}</p>
            ${data.tenantPhone ? `<p><strong>Phone:</strong> ${data.tenantPhone}</p>` : ""}
            <p><strong>Message:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 4px; font-style: italic;">
              "${data.message}"
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/landlord" 
               style="background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Respond to Inquiry
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Tip:</strong> Quick responses lead to higher booking rates!
          </p>
        </div>
      </div>
    `,
    text: `New inquiry for your property "${data.propertyTitle}" from ${data.tenantName}. Message: "${data.message}". Respond at ${process.env.NEXT_PUBLIC_APP_URL}/landlord`,
  }),

  paymentConfirmation: (data) => ({
    subject: "Payment Confirmation - BulaRent",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Payment Confirmed! ✅</h1>
        </div>
        <div style="padding: 40px; background: white;">
          <h2 style="color: #1f2937;">Thank you, ${data.userName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your payment has been successfully processed.
          </p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #065f46; margin-top: 0;">Payment Details:</h3>
            <p><strong>Amount:</strong> $${data.amount}</p>
            <p><strong>Service:</strong> ${data.description}</p>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Keep this email for your records. If you have any questions, contact support@bularent.fj
          </p>
        </div>
      </div>
    `,
    text: `Payment confirmed! Amount: $${data.amount} for ${data.description}. Transaction ID: ${data.transactionId}`,
  }),
}

export async function sendEmail(userId: string, email: string, templateName: string, templateData: any) {
  try {
    const template = emailTemplates[templateName]
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`)
    }

    const { subject, html, text } = template(templateData)

    // Log email to database
    const { error: logError } = await supabase.from("email_notifications").insert({
      user_id: userId,
      email,
      subject,
      template_name: templateName,
      status: "sent",
      sent_at: new Date().toISOString(),
    })

    if (logError) {
      console.error("Error logging email:", logError)
    }

    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Postmark

    console.log(`Email sent to ${email}:`, { subject, templateName })

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)

    // Log failed email
    await supabase.from("email_notifications").insert({
      user_id: userId,
      email,
      subject: `Failed: ${templateName}`,
      template_name: templateName,
      status: "failed",
      error_message: error instanceof Error ? error.message : "Unknown error",
    })

    return { success: false, error }
  }
}

// Email notification triggers
export async function sendWelcomeEmail(userId: string, email: string, name: string) {
  return sendEmail(userId, email, "welcome", { name })
}

export async function sendPropertyApprovedEmail(
  userId: string,
  email: string,
  landlordName: string,
  propertyTitle: string,
  propertyId: string,
) {
  return sendEmail(userId, email, "propertyApproved", {
    landlordName,
    propertyTitle,
    propertyId,
  })
}

export async function sendNewInquiryEmail(
  landlordId: string,
  landlordEmail: string,
  landlordName: string,
  propertyTitle: string,
  tenantName: string,
  tenantEmail: string,
  tenantPhone: string | null,
  message: string,
) {
  return sendEmail(landlordId, landlordEmail, "newInquiry", {
    landlordName,
    propertyTitle,
    tenantName,
    tenantEmail,
    tenantPhone,
    message,
  })
}

export async function sendPaymentConfirmationEmail(
  userId: string,
  email: string,
  userName: string,
  amount: number,
  description: string,
  transactionId: string,
) {
  return sendEmail(userId, email, "paymentConfirmation", {
    userName,
    amount,
    description,
    transactionId,
  })
}
