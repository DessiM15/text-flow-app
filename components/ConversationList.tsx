'use client'

import { Conversation } from '@/lib/supabase/types'

interface ConversationListProps {
  conversations: Conversation[]
  selectedPhoneNumber: string | null
  onSelect: (phoneNumber: string) => void
}

export default function ConversationList({
  conversations,
  selectedPhoneNumber,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Conversations</h2>
      </div>
      <div className="overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.phone_number}
              onClick={() => onSelect(conversation.phone_number)}
              className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedPhoneNumber === conversation.phone_number
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                  : ''
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {conversation.phone_number}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                {conversation.last_message}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(conversation.last_message_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

