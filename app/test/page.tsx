'use client'

import { useState } from 'react'

export default function TestPage() {
  const [results, setResults] = useState<any>({})

  const testAPI = async (endpoint: string, method = 'GET', body?: any) => {
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      }
      if (body) options.body = JSON.stringify(body)

      const response = await fetch(endpoint, options)
      const data = await response.json()
      setResults((prev: any) => ({ ...prev, [endpoint]: data }))
      return data
    } catch (error: any) {
      setResults((prev: any) => ({ ...prev, [endpoint]: { error: error.message } }))
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={() => testAPI('/api/config')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Config API
        </button>
        
        <button
          onClick={() => testAPI('/api/conversations')}
          className="px-4 py-2 bg-blue-500 text-white rounded ml-2"
        >
          Test Conversations API
        </button>
        
        <button
          onClick={() => testAPI('/api/messages')}
          className="px-4 py-2 bg-blue-500 text-white rounded ml-2"
        >
          Test Messages API
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Results:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  )
}

