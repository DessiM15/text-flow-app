export interface Message {
  id: string
  from_number: string
  to_number: string
  body: string
  direction: 'inbound' | 'outbound'
  status: string
  created_at: string
  twilio_sid?: string
}

export interface Contact {
  id: string
  phone_number: string
  name?: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  phone_number: string
  last_message: string
  last_message_at: string
  unread_count: number
}

