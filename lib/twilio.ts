import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const phoneNumber = process.env.TWILIO_PHONE_NUMBER!

export const twilioClient = twilio(accountSid, authToken)

export async function sendSMS(to: string, message: string) {
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: phoneNumber,
      to: to,
    })
    return { success: true, sid: result.sid, error: null }
  } catch (error: any) {
    console.error('Error sending SMS:', error)
    return { success: false, sid: null, error: error.message }
  }
}

