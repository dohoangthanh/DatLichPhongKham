'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface Knowledge {
  knowledgeId: number
  question: string
  answer: string
  category: string
  usageCount: number
  createdDate: string
  lastUsedDate?: string
  isActive: boolean
  createdBy?: string
}

export default function ChatKnowledgePage() {
  const [knowledgeList, setKnowledgeList] = useState<Knowledge[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general'
  })

  useEffect(() => {
    fetchKnowledge()
  }, [])

  const fetchKnowledge = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/localchat/knowledge`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setKnowledgeList(data)
      }
    } catch (error) {
      console.error('Error fetching knowledge:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const url = editingId 
        ? `${API_URL}/localchat/knowledge/${editingId}`
        : `${API_URL}/localchat/knowledge`
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm kiến thức thành công!')
        setShowForm(false)
        setEditingId(null)
        setFormData({ question: '', answer: '', category: 'general' })
        fetchKnowledge()
      }
    } catch (error) {
      alert('Có lỗi xảy ra')
    }
  }

  const handleEdit = (knowledge: Knowledge) => {
    setFormData({
      question: knowledge.question,
      answer: knowledge.answer,
      category: knowledge.category
    })
    setEditingId(knowledge.knowledgeId)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa kiến thức này?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/localchat/knowledge/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('Xóa thành công!')
        fetchKnowledge()
      }
    } catch (error) {
      alert('Có lỗi xảy ra')
    }
  }

  const getCategoryName = (category: string) => {
    const categories: any = {
      'general': 'Chung',
      'service': 'Dịch vụ',
      'doctor': 'Bác sĩ',
      'appointment': 'Đặt lịch'
    }
    return categories[category] || category
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Chatbot</h1>
            <p className="text-gray-600 mt-2">Dạy chatbot trả lời các câu hỏi từ khách hàng</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              setFormData({ question: '', answer: '', category: 'general' })
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm kiến thức
          </button>
        </div>

        {/* Form thêm/sửa */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-blue-200">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? 'Chỉnh sửa kiến thức' : 'Thêm kiến thức mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Câu hỏi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Giờ làm việc của phòng khám"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Câu trả lời <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập câu trả lời chi tiết..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">Chung</option>
                    <option value="service">Dịch vụ</option>
                    <option value="doctor">Bác sĩ</option>
                    <option value="appointment">Đặt lịch</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingId ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                      setFormData({ question: '', answer: '', category: 'general' })
                    }}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Danh sách kiến thức */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-semibold">Tổng số: {knowledgeList.filter(k => k.isActive).length} câu hỏi</h3>
          </div>
          <div className="divide-y">
            {knowledgeList.filter(k => k.isActive).map((knowledge) => (
              <div key={knowledge.knowledgeId} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{knowledge.question}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {getCategoryName(knowledge.category)}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{knowledge.answer}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(knowledge)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Sửa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(knowledge.knowledgeId)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Xóa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-500 mt-3">
                  <span>📊 Đã dùng: {knowledge.usageCount} lần</span>
                  <span>📅 Tạo: {new Date(knowledge.createdDate).toLocaleDateString('vi-VN')}</span>
                  {knowledge.lastUsedDate && (
                    <span>🕒 Dùng gần nhất: {new Date(knowledge.lastUsedDate).toLocaleDateString('vi-VN')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
