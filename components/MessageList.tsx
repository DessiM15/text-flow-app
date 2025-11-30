'use client'

import { useEffect, useRef } from 'react'
import { Message } from '@/lib/supabase/types'

interface MessageListProps {
  messages: Message[]
  phoneNumber: string
  twilioPhoneNumber: string
}

export default function MessageList({ messages, phoneNumber, twilioPhoneNumber }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No messages yet. Start a conversation!
        </div>
      ) : (
        messages.map((message) => {
          const isOutbound = message.from_number === twilioPhoneNumber
          return (
            <div
              key={message.id}
              className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOutbound
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm">{message.body}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOutbound ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

