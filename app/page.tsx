'use client'

import { useState, useEffect } from 'react'
import ConversationList from '@/components/ConversationList'
import MessageList from '@/components/MessageList'
import MessageInput from '@/components/MessageInput'
import ThemeToggle from '@/components/ThemeToggle'
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
        // Messages are already ordered ascending (oldest first) from API
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!selectedPhoneNumber) return

    setSending(true)
    try {
      // Ensure phone number is formatted before sending
      const formattedPhone = formatPhoneNumberForStorage(selectedPhoneNumber)
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Send message failed:', errorData)
        alert('Failed to send message: ' + (errorData.error || 'Unknown error'))
        return
      }

      const data = await response.json()
      console.log('Send message response:', data)

      if (data.success) {
        // Add the sent message immediately to the UI for better UX
        if (data.message) {
          setMessages((prev) => [...prev, data.message])
        }
        // Refresh messages and conversations after a short delay to ensure DB is updated
        // Use formatted phone number to ensure we fetch the right messages
        const formattedPhone = formatPhoneNumberForStorage(selectedPhoneNumber)
        setTimeout(async () => {
          await fetchMessages(formattedPhone)
          await fetchConversations()
        }, 500)
      } else {
        console.error('Send message failed:', data)
        alert('Failed to send message: ' + (data.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      alert('Failed to send message: ' + (error.message || 'Network error'))
    } finally {
      setSending(false)
    }
  }

  const formatPhoneNumberForStorage = (phone: string): string => {
    // Ensure phone number is in E.164 format (starts with +)
    let formatted = phone.trim()
    if (!formatted.startsWith('+')) {
      // If it doesn't start with +, assume it's a US number and add +1
      formatted = formatted.replace(/^1/, '') // Remove leading 1 if present
      formatted = `+1${formatted.replace(/\D/g, '')}` // Remove non-digits and add +1
    }
    return formatted
  }

  const handleStartNewConversation = () => {
    const phone = newPhoneNumber.trim()
    if (phone) {
      const formattedPhone = formatPhoneNumberForStorage(phone)
      setSelectedPhoneNumber(formattedPhone)
      setNewPhoneNumber('')
      setShowNewConversation(false)
      fetchMessages(formattedPhone)
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Simple formatting - you can enhance this
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Conversations Sidebar */}
      <div className="hidden md:block">
        <ConversationList
          conversations={conversations}
          selectedPhoneNumber={selectedPhoneNumber}
          onSelect={setSelectedPhoneNumber}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {selectedPhoneNumber ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatPhoneNumber(selectedPhoneNumber)}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPhoneNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={() => {
                      setSelectedPhoneNumber(null)
                      setMessages([])
                    }}
                    className="md:hidden px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    ← Back
                  </button>
                </div>
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
              <div className="flex justify-end mb-4">
                <ThemeToggle />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Welcome to TextFlow
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
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
                    placeholder="Enter phone number (e.g., +18327905001 or 8327905001)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleStartNewConversation()
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    US numbers: Enter with or without +1 (e.g., +18327905001 or 8327905001)
                  </p>
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
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
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
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Recent Conversations</h3>
                  <div className="space-y-2">
                    {conversations.slice(0, 5).map((conv) => (
                      <button
                        key={conv.phone_number}
                        onClick={() => setSelectedPhoneNumber(conv.phone_number)}
                        className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">{conv.phone_number}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
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
