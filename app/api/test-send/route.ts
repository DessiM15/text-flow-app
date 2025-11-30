import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/twilio'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json()

    console.log('=== TEST SEND START ===')
    console.log('Received:', { to, message })
    console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER)
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET')
    console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET')

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      )
    }

    // Ensure phone number is in E.164 format
    let formattedTo = to.trim()
    if (!formattedTo.startsWith('+')) {
      formattedTo = formattedTo.replace(/^1/, '')
      formattedTo = `+1${formattedTo.replace(/\D/g, '')}`
    }

    console.log('Formatted phone number:', formattedTo)

    // Test Twilio connection
    console.log('Attempting to send SMS via Twilio...')
    const result = await sendSMS(formattedTo, message)
    console.log('Twilio result:', result)

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error || 'Failed to send message',
          details: result
        },
        { status: 500 }
      )
    }

    // Test database connection
    console.log('Attempting to save to database...')
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!
    const supabase = getSupabaseAdmin()
    
    const { data: insertedData, error: dbError } = await supabase
      .from('messages')
      .insert({
        from_number: twilioPhoneNumber,
        to_number: formattedTo,
        body: message,
        direction: 'outbound',
        status: 'sent',
        twilio_sid: result.sid,
      })
      .select()

    console.log('Database result:', { insertedData, dbError })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        success: true,
        sid: result.sid,
        warning: 'Message sent but not saved to database',
        dbError: dbError.message,
      })
    }

    console.log('=== TEST SEND SUCCESS ===')
    return NextResponse.json({
      success: true,
      sid: result.sid,
      message: insertedData?.[0],
    })
  } catch (error: any) {
    console.error('=== TEST SEND ERROR ===', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}

