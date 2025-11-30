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

    // Ensure phone numbers are properly formatted (no spaces, just + and digits)
    const cleanTo = to.replace(/\s+/g, '')
    const cleanFrom = phoneNumber.replace(/\s+/g, '')

    console.log('Twilio sendSMS called:', { to: cleanTo, from: cleanFrom, messageLength: message.length })
    
    const client = getTwilioClient()
    const result = await client.messages.create({
      body: message,
      from: cleanFrom,
      to: cleanTo,
      statusCallback: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/status-callback` : undefined,
    })
    
    console.log('Twilio message created:', result.sid, 'Status:', result.status)
    return { 
      success: true, 
      sid: result.sid, 
      status: result.status,
      error: null 
    }
  } catch (error: any) {
    console.error('Error sending SMS:', error)
    // Provide more detailed error information
    const errorMessage = error.message || 'Unknown error'
    const errorCode = error.code || 'NO_CODE'
    return { 
      success: false, 
      sid: null, 
      error: `${errorMessage} (Code: ${errorCode})`,
      details: error
    }
  }
}

