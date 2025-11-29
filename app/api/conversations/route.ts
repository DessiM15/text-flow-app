import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Get all unique phone numbers from messages
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('from_number, to_number, body, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      )
    }

    // Group messages by phone number
    const conversationsMap = new Map<string, any>()
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!

    messages?.forEach((msg) => {
      // Determine the other party's phone number
      const otherNumber =
        msg.from_number === twilioPhoneNumber
          ? msg.to_number
          : msg.from_number

      if (!conversationsMap.has(otherNumber)) {
        conversationsMap.set(otherNumber, {
          phone_number: otherNumber,
          last_message: msg.body,
          last_message_at: msg.created_at,
          unread_count: 0, // You can implement read tracking later
        })
      }
    })

    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) =>
        new Date(b.last_message_at).getTime() -
        new Date(a.last_message_at).getTime()
    )

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error in GET /api/conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

