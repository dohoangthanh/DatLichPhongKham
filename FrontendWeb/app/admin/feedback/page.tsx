'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { feedbackApi } from '@/services/adminApi'

interface Patient {
  patientId: number
  name: string
  phone: string
}

interface Doctor {
  doctorId: number
  name: string
  specialty: string | null
}

interface Feedback {
  feedbackId: number
  rating: number | null
  comment: string | null
  createdDate: string
  replyText: string | null
  repliedDate: string | null
  patient: Patient | null
  doctor: Doctor | null
}

interface FeedbackResponse {
  data: Feedback[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const pageSize = 10

  useEffect(() => {
    fetchFeedbacks()
  }, [currentPage])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      const response: FeedbackResponse = await feedbackApi.getAll(currentPage, pageSize)
      setFeedbacks(response.data)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      alert('Lỗi khi tải danh sách đánh giá!')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (feedbackId: number) => {
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi!')
      return
    }

    try {
      setSubmitting(true)
      await feedbackApi.reply(feedbackId, replyText)
      alert('Gửi phản hồi thành công!')
      setReplyingTo(null)
      setReplyText('')
      fetchFeedbacks()
    } catch (error) {
      console.error('Error replying to feedback:', error)
      alert('Lỗi khi gửi phản hồi!')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400">Chưa đánh giá</span>
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && currentPage === 1) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Đánh giá Khách hàng</h1>
            <p className="text-gray-600 mt-1">Xem và phản hồi các đánh giá từ bệnh nhân</p>
          </div>
        </div>

        {/* Feedback List */}
        <div className="bg-white rounded-lg shadow">
          {feedbacks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chưa có đánh giá nào
            </div>
          ) : (
            <div className="divide-y">
              {feedbacks.map((feedback) => (
                <div key={feedback.feedbackId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">
                            {feedback.patient?.name || 'Bệnh nhân ẩn danh'}
                          </span>
                          {renderStars(feedback.rating)}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span>Ngày gửi: {formatDate(feedback.createdDate)}</span>
                          {feedback.patient?.phone && (
                            <span className="ml-4">SĐT: {feedback.patient.phone}</span>
                          )}
                        </div>
                        {feedback.doctor && (
                          <div className="text-sm text-gray-600">
                            Bác sĩ: <span className="font-medium">{feedback.doctor.name}</span>
                            {feedback.doctor.specialty && (
                              <span className="ml-2 text-gray-500">({feedback.doctor.specialty})</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {!feedback.replyText && (
                        <button
                          onClick={() => {
                            setReplyingTo(feedback.feedbackId)
                            setReplyText('')
                          }}
                          className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Phản hồi
                        </button>
                      )}
                    </div>

                    {/* Comment */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">
                        {feedback.comment || <span className="italic text-gray-400">Không có nội dung</span>}
                      </p>
                    </div>

                    {/* Reply Section */}
                    {feedback.replyText && (
                      <div className="ml-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-blue-900">Phản hồi từ Admin</span>
                          <span className="text-xs text-blue-600">
                            {formatDate(feedback.repliedDate)}
                          </span>
                        </div>
                        <p className="text-gray-700">{feedback.replyText}</p>
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === feedback.feedbackId && (
                      <div className="ml-8 space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Nhập nội dung phản hồi..."
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReply(feedback.feedbackId)}
                            disabled={submitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                          >
                            {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyText('')
                            }}
                            disabled={submitting}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="text-gray-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default FeedbackPage
