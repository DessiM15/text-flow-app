import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const body = formData.get('Body') as string
    const messageSid = formData.get('MessageSid') as string

    // Store incoming message in database
    const { error } = await getSupabaseAdmin()
      .from('messages')
      .insert({
        from_number: from,
        to_number: to,
        body: body,
        direction: 'inbound',
        status: 'received',
        twilio_sid: messageSid,
      })

    if (error) {
      console.error('Error saving message:', error)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

