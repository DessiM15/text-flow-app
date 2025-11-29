import twilio from 'twilio'
import type { Twilio } from 'twilio'

let twilioClientInstance: Twilio | null = null

function getTwilioClient(): Twilio {
  if (!twilioClientInstance) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      throw new Error('Missing Twilio environment variables')
    }

    twilioClientInstance = twilio(accountSid, authToken)
  }

  return twilioClientInstance
}

export async function sendSMS(to: string, message: string) {
  try {
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER
    if (!phoneNumber) {
      throw new Error('Missing TWILIO_PHONE_NUMBER environment variable')
    }

    const client = getTwilioClient()
    const result = await client.messages.create({
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

