import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

function normalizePhoneNumber(phone: string): string {
  // Ensure phone number is in E.164 format (starts with +)
  let formatted = phone.trim()
  if (!formatted.startsWith('+')) {
    // If it doesn't start with +, assume it's a US number and add +1
    formatted = formatted.replace(/^1/, '') // Remove leading 1 if present
    formatted = `+1${formatted.replace(/\D/g, '')}` // Remove non-digits and add +1
  }
  return formatted
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phoneNumber = searchParams.get('phoneNumber')
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = getSupabaseAdmin()
    
    if (phoneNumber) {
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!
      // Normalize the phone number to ensure consistent format
      const normalizedPhone = normalizePhoneNumber(phoneNumber)
      
      // Get messages where the selected phone number is either sender or receiver
      // and the other party is the Twilio number
      // Query with normalized phone number (primary) and also check original format for legacy data
      const phoneVariants = [normalizedPhone]
      if (phoneNumber !== normalizedPhone) {
        phoneVariants.push(phoneNumber)
      }
      
      // Get messages where user sent to Twilio
      const { data: data1, error: error1 } = await supabase
        .from('messages')
        .select('*')
        .in('from_number', phoneVariants)
        .eq('to_number', twilioPhoneNumber)
        .order('created_at', { ascending: true })

      // Get messages where Twilio sent to user
      const { data: data2, error: error2 } = await supabase
        .from('messages')
        .select('*')
        .eq('from_number', twilioPhoneNumber)
        .in('to_number', phoneVariants)
        .order('created_at', { ascending: true })

      if (error1 || error2) {
        console.error('Error fetching messages:', error1 || error2)
        return NextResponse.json(
          { error: 'Failed to fetch messages' },
          { status: 500 }
        )
      }

      // Combine and sort messages
      const allMessages = [...(data1 || []), ...(data2 || [])]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .slice(0, limit)

      return NextResponse.json({ messages: allMessages })
    } else {
      // If no phone number specified, return all messages
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json(
          { error: 'Failed to fetch messages' },
          { status: 500 }
        )
      }

      return NextResponse.json({ messages: data || [] })
    }
  } catch (error) {
    console.error('Error in GET /api/messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

