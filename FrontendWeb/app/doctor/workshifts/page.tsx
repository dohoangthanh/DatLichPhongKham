'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DoctorLayout from '@/components/DoctorLayout'

interface WorkShift {
  shiftId: number
  doctorId: number
  date: string
  startTime: string
  endTime: string
}

export default function DoctorWorkShiftsPage() {
  const { user } = useAuth()
  const [shifts, setShifts] = useState<WorkShift[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: ''
  })

  useEffect(() => {
    if (user?.doctorId) {
      fetchShifts()
    }
  }, [user])

  const fetchShifts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5129/api/schedule/workshift/${user?.doctorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setShifts(data.sort((a: WorkShift, b: WorkShift) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ))
      }
    } catch (error) {
      console.error('Error fetching shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5129/api/schedule/workshift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: user?.doctorId,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime
        })
      })

      if (response.ok) {
        alert('Đăng ký ca làm việc thành công!')
        setShowModal(false)
        setFormData({ date: '', startTime: '', endTime: '' })
        fetchShifts()
      } else {
        const error = await response.json()
        alert(error.message || 'Có lỗi xảy ra khi đăng ký ca làm việc')
      }
    } catch (error) {
      console.error('Error creating shift:', error)
      alert('Có lỗi xảy ra!')
    }
  }

  const handleDelete = async (shiftId: number) => {
    if (!confirm('Bạn có chắc muốn xóa ca làm việc này?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5129/api/schedule/workshift/${shiftId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('Xóa ca làm việc thành công!')
        fetchShifts()
      } else {
        const error = await response.json()
        alert(error.message || 'Không thể xóa ca làm việc này')
      }
    } catch (error) {
      console.error('Error deleting shift:', error)
      alert('Có lỗi xảy ra!')
    }
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <DoctorLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Ca Làm Việc</h1>
            <p className="text-gray-600 mt-1">Đăng ký và quản lý ca làm việc của bạn</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Đăng Ký Ca Mới
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : shifts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xl font-medium text-gray-900 mb-2">Chưa có ca làm việc</p>
            <p className="text-gray-600">Nhấn "Đăng Ký Ca Mới" để thêm ca làm việc</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
              <div key={shift.shiftId} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ngày làm việc</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(shift.date).toLocaleDateString('vi-VN', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Bắt đầu:</span>
                    <span>{shift.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Kết thúc:</span>
                    <span>{shift.endTime}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(shift.shiftId)}
                  className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  Xóa Ca
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Đăng Ký Ca Làm Việc Mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày Làm Việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={getMinDate()}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ Bắt Đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ Kết Thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ date: '', startTime: '', endTime: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Đăng Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
