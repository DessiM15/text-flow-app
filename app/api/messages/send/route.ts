import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/twilio'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      )
    }

    // Send SMS via Twilio
    const result = await sendSMS(to, message)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send message' },
        { status: 500 }
      )
    }

    // Store sent message in database
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!
    const { error: dbError } = await getSupabaseAdmin()
      .from('messages')
      .insert({
        from_number: twilioPhoneNumber,
        to_number: to,
        body: message,
        direction: 'outbound',
        status: 'sent',
        twilio_sid: result.sid,
      })

    if (dbError) {
      console.error('Error saving message to database:', dbError)
      // Don't fail the request if DB save fails - message was sent
    }

    return NextResponse.json({
      success: true,
      sid: result.sid,
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

