'use client'

import { useState, useEffect } from 'react'
import ConversationList from '@/components/ConversationList'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import { Message, Conversation } from '@/lib/supabase/types'

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState('')

  // Fetch Twilio phone number
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setTwilioPhoneNumber(data.twilioPhoneNumber))
      .catch(console.error)
  }, [])

  // Fetch conversations
  useEffect(() => {
    fetchConversations()
    // Poll for new conversations every 5 seconds
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (selectedPhoneNumber) {
      fetchMessages(selectedPhoneNumber)
      // Poll for new messages every 2 seconds
      const interval = setInterval(() => fetchMessages(selectedPhoneNumber), 2000)
      return () => clearInterval(interval)
    }
  }, [selectedPhoneNumber])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      if (data.conversations) {
        setConversations(data.conversations)
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setLoading(false)
    }
  }

  const fetchMessages = async (phoneNumber: string) => {
    try {
      const response = await fetch(`/api/messages?phoneNumber=${encodeURIComponent(phoneNumber)}`)
      const data = await response.json()
      if (data.messages) {
        setMessages(data.messages.reverse()) // Reverse to show oldest first
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!selectedPhoneNumber) return

    setSending(true)
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedPhoneNumber,
          message: message,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh messages and conversations
        await fetchMessages(selectedPhoneNumber)
        await fetchConversations()
      } else {
        alert('Failed to send message: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleStartNewConversation = () => {
    const phone = newPhoneNumber.trim()
    if (phone) {
      setSelectedPhoneNumber(phone)
      setNewPhoneNumber('')
      setShowNewConversation(false)
      fetchMessages(phone)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Simple formatting - you can enhance this
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations Sidebar */}
      <div className="hidden md:block">
        <ConversationList
          conversations={conversations}
          selectedPhoneNumber={selectedPhoneNumber}
          onSelect={setSelectedPhoneNumber}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedPhoneNumber ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {formatPhoneNumber(selectedPhoneNumber)}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedPhoneNumber}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPhoneNumber(null)
                    setMessages([])
                  }}
                  className="md:hidden px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  ← Back
                </button>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={messages}
              phoneNumber={selectedPhoneNumber}
              twilioPhoneNumber={twilioPhoneNumber}
            />

            {/* Message Input */}
            <MessageInput onSend={handleSendMessage} disabled={sending} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to TextFlow
              </h2>
              <p className="text-gray-600 mb-6">
                {conversations.length === 0
                  ? 'Get started by sending your first message!'
                  : 'Select a conversation from the sidebar or start a new one.'}
              </p>

              {showNewConversation ? (
                <div className="space-y-4">
                  <input
                    type="tel"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    placeholder="Enter phone number (e.g., +1234567890)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleStartNewConversation()
                      }
                    }}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleStartNewConversation}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Start Conversation
                    </button>
                    <button
                      onClick={() => {
                        setShowNewConversation(false)
                        setNewPhoneNumber('')
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewConversation(true)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                >
                  New Conversation
                </button>
              )}

              {/* Mobile: Show conversations list */}
              {conversations.length > 0 && (
                <div className="mt-8 md:hidden">
                  <h3 className="text-lg font-semibold mb-4">Recent Conversations</h3>
                  <div className="space-y-2">
                    {conversations.slice(0, 5).map((conv) => (
                      <button
                        key={conv.phone_number}
                        onClick={() => setSelectedPhoneNumber(conv.phone_number)}
                        className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="font-medium">{conv.phone_number}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {conv.last_message}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
