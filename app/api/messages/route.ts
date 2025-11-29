import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phoneNumber = searchParams.get('phoneNumber')
    const limit = parseInt(searchParams.get('limit') || '50')

    let query = getSupabaseAdmin()
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (phoneNumber) {
      query = query.or(`from_number.eq.${phoneNumber},to_number.eq.${phoneNumber}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages: data || [] })
  } catch (error) {
    console.error('Error in GET /api/messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

