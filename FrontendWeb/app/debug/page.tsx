'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function DebugPage() {
  const { user, token, loading } = useAuth()

  const handleCheckStorage = () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    
    console.log('Stored User:', storedUser)
    console.log('Stored Token:', storedToken)
    
    if (storedToken) {
      try {
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]))
        console.log('Token Payload:', tokenPayload)
      } catch (e) {
        console.error('Error parsing token:', e)
      }
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Auth Info</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Current User State:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Token:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto break-all">
            {token ? token.substring(0, 50) + '...' : 'No token'}
          </pre>
        </div>

        <button
          onClick={handleCheckStorage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Check LocalStorage (Check Console)
        </button>
      </div>
    </div>
  )
}
