import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  })
}

