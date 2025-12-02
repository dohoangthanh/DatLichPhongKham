'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AdminLayout from '@/components/AdminLayout'
import * as signalR from '@microsoft/signalr'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface ChatMessage {
  messageId: number
  message: string
  senderRole: string
  sentAt: string
  isRead: boolean
  adminName?: string
  patientName?: string
}

interface Conversation {
  patientId: number
  patientName: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function AdminChatPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isNearBottomRef = useRef(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Admin')) {
      router.replace('/login')
    } else if (user && token) {
      fetchConversations()
      connectToHub()
    }

    return () => {
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop()
      }
    }
  }, [user, loading, token])

  useEffect(() => {
    if (selectedPatientId) {
      fetchMessages(selectedPatientId)
    }
  }, [selectedPatientId])

  useEffect(() => {
    // Only auto-scroll if user is near bottom
    if (isNearBottomRef.current) {
      scrollToBottom()
    }
  }, [messages])

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      isNearBottomRef.current = isNearBottom
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  const connectToHub = async () => {
    try {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`http://localhost:5129/chatHub?access_token=${token}`, {
          accessTokenFactory: () => token || ''
        })
        .withAutomaticReconnect()
        .build()

      connection.on('ReceiveMessageFromPatient', (data) => {
        console.log('📩 New message from patient:', data)
        
        // Cập nhật danh sách conversations
        fetchConversations()
        
        // Chỉ thêm message nếu đang xem chat của patient này
        if (data.patientId) {
          setMessages(prev => {
            // Kiểm tra xem message đã tồn tại chưa (tránh duplicate)
            const exists = prev.some(m => 
              (m.messageId === data.messageId) || 
              (m.message === data.message && m.senderRole === 'Patient' && 
               Math.abs(new Date(m.sentAt).getTime() - new Date(data.timestamp).getTime()) < 2000)
            )
            
            if (exists) {
              console.log('⚠️ Message already exists, skipping')
              return prev
            }
            
            const newMessage: ChatMessage = {
              messageId: data.messageId || Date.now(),
              message: data.message,
              senderRole: 'Patient',
              sentAt: data.timestamp || new Date().toISOString(),
              isRead: true,
              patientName: data.patientName
            }
            
            console.log('✅ Adding new message to chat:', newMessage)
            return [...prev, newMessage]
          })
        }
      })

      connection.onclose(() => setIsConnected(false))
      connection.onreconnecting(() => setIsConnected(false))
      connection.onreconnected(() => setIsConnected(true))

      await connection.start()
      setIsConnected(true)
      hubConnectionRef.current = connection
      console.log('SignalR Connected')
    } catch (error) {
      console.error('SignalR connection error:', error)
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
    }
  }

  const fetchMessages = async (patientId: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/chat/conversation/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data)
        
        // Cập nhật lại conversations để clear unread count
        fetchConversations()
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedPatientId || isSending) return

    const messageText = inputValue.trim()
    const tempMessage: ChatMessage = {
      messageId: Date.now(),
      message: messageText,
      senderRole: 'Admin',
      sentAt: new Date().toISOString(),
      isRead: false,
      adminName: user?.username
    }

    // Hiển thị message ngay lập tức
    setMessages(prev => [...prev, tempMessage])
    setInputValue('')
    setIsSending(true)

    try {
      // 1. Lưu vào database qua REST API
      const response = await fetch(`${API_URL}/chat/reply/${selectedPatientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()
      console.log('✅ Message saved to DB:', result)

      // Update temp message with real messageId
      setMessages(prev => 
        prev.map(m => m.messageId === tempMessage.messageId 
          ? { ...m, messageId: result.messageId }
          : m
        )
      )

      // 2. Gửi realtime qua SignalR
      if (hubConnectionRef.current && isConnected) {
        try {
          await hubConnectionRef.current.invoke('SendMessageToPatient', selectedPatientId.toString(), messageText)
          console.log('✅ Message sent via SignalR to patient')
        } catch (signalRError) {
          console.error('⚠️ SignalR send failed (message already saved to DB):', signalRError)
        }
      }

      // Cập nhật conversations
      fetchConversations()
    } catch (error) {
      console.error('❌ Error sending message:', error)
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.')
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.messageId !== tempMessage.messageId))
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  const selectedConversation = conversations.find(c => c.patientId === selectedPatientId)

  return (
    <AdminLayout>
      {/* Modern Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Tin nhắn
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              {isConnected ? 'Đang kết nối' : 'Mất kết nối'}
            </div>
          </div>
        </div>
      </div>

      {/* Messenger-style Chat Container */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full">
          {/* Conversations Sidebar - Messenger Style */}
          <div className="w-[360px] border-r border-gray-200 flex flex-col bg-white">
            {/* Search Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Hội thoại</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm bệnh nhân..."
                  className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
                  <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">Chưa có tin nhắn</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.patientId}
                    onClick={() => setSelectedPatientId(conv.patientId)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-all duration-200 ${
                      selectedPatientId === conv.patientId ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                        selectedPatientId === conv.patientId ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        {conv.patientName.charAt(0).toUpperCase()}
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{conv.unreadCount}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {conv.patientName}
                        </h3>
                        <span className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</span>
                      </div>
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area - Messenger Style */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedPatientId ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {selectedConversation?.patientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="font-semibold text-gray-900">{selectedConversation?.patientName}</h2>
                        <p className="text-xs text-gray-500">Bệnh nhân</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages Container - Messenger Style */}
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto px-6 py-4" 
                  style={{ backgroundColor: '#f8f9fa' }}
                >
                  {isLoading && messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                        <p className="text-sm text-gray-500">Đang tải tin nhắn...</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p>Chưa có tin nhắn</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        const showAvatar = index === 0 || messages[index - 1].senderRole !== message.senderRole
                        const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderRole !== message.senderRole
                        
                        return (
                          <div
                            key={message.messageId}
                            className={`flex items-end gap-2 mb-1 ${message.senderRole === 'Admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            {/* Avatar for Patient */}
                            {message.senderRole !== 'Admin' && (
                              <div className="w-7 h-7 flex-shrink-0">
                                {showAvatar && (
                                  <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-semibold">
                                    {selectedConversation?.patientName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Message Bubble */}
                            <div className={`max-w-[65%] ${message.senderRole === 'Admin' ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div
                                className={`px-4 py-2 ${
                                  message.senderRole === 'Admin'
                                    ? 'bg-blue-600 text-white rounded-3xl rounded-br-md'
                                    : 'bg-white text-gray-900 rounded-3xl rounded-bl-md shadow-sm'
                                }`}
                              >
                                <p className="text-[15px] leading-relaxed break-words">{message.message}</p>
                              </div>
                              {isLastInGroup && (
                                <span className={`text-xs text-gray-500 mt-1 px-3 ${message.senderRole === 'Admin' ? 'text-right' : ''}`}>
                                  {formatMessageTime(message.sentAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input Area - Messenger Style - Fixed Height */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white" style={{ minHeight: '80px' }}>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 self-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isSending}
                        placeholder="Aa"
                        className="w-full px-4 py-2.5 bg-gray-100 rounded-full text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-none"
                        style={{ height: '44px' }}
                      />
                    </div>

                    <button
                      onClick={handleSendMessage}
                      disabled={isSending || !inputValue.trim()}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 self-center"
                      style={{ width: '44px', height: '44px' }}
                    >
                      {isSending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-white">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Chọn cuộc trò chuyện</h3>
                  <p className="text-sm text-gray-500">Chọn một bệnh nhân từ danh sách để bắt đầu nhắn tin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
