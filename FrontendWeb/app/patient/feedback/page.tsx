'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface Feedback {
  feedbackId: number
  rating: number
  comment: string
  createdDate: string
  replyText?: string
  repliedDate?: string
  doctor?: {
    doctorId: number
    name: string
    specialty?: string
  }
}

export default function PatientFeedbackPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    } else if (user && user.role === 'Patient') {
      fetchFeedbacks()
    }
  }, [user, loading, router])

  const fetchFeedbacks = async () => {
    try {
      setLoadingData(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5129/api/feedback/my-feedback', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setFeedbacks(data)
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    )
  }

  if (loading || !user || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (user.role !== 'Patient') {
    return null
  }

  return (
    <main>
      <Header />
      <Navigation />

      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            Đánh Giá Của Tôi
          </h1>
          <p className="text-lg text-gray-700">
            Xem lại các đánh giá và phản hồi từ phòng khám
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          {feedbacks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-xl font-medium text-gray-900 mb-2">
                Chưa có đánh giá nào
              </p>
              <p className="text-gray-600">
                Bạn chưa gửi đánh giá nào cho phòng khám
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.feedbackId}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {feedback.doctor?.name || 'Bác sĩ'}
                        </h3>
                        {feedback.doctor?.specialty && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                            {feedback.doctor.specialty}
                          </span>
                        )}
                      </div>
                      {renderStars(feedback.rating)}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(feedback.createdDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {feedback.comment}
                    </p>
                  </div>

                  {feedback.replyText && (
                    <div className="mt-4 pl-4 border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        <p className="font-semibold text-blue-900">
                          Phản hồi từ Phòng Khám
                        </p>
                      </div>
                      <p className="text-gray-700 mb-2">{feedback.replyText}</p>
                      {feedback.repliedDate && (
                        <p className="text-xs text-gray-500">
                          {new Date(feedback.repliedDate).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/patient')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Quay lại Trang Chủ
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
