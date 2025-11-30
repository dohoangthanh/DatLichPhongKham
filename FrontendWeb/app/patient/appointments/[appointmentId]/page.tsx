'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface AppointmentDetail {
  appointmentId: number
  date: string
  time: string
  status: string
  doctor?: {
    doctorId: number
    name: string
    specialtyName?: string
  } | null
  patient?: {
    patientId: number
    name: string
    phone: string
    dob?: string
    gender?: string
    address?: string
  } | null
}

export default function AppointmentDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const appointmentId = params?.appointmentId as string
  
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    } else if (user && appointmentId) {
      fetchAppointmentDetail()
    }
  }, [user, loading, router, appointmentId])

  const fetchAppointmentDetail = async () => {
    try {
      setLoadingData(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5129/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointment(data)
      } else {
        alert('Không tìm thấy thông tin lịch khám')
        router.push('/patient/appointments')
      }
    } catch (error) {
      console.error('Error fetching appointment detail:', error)
      alert('Có lỗi xảy ra khi tải thông tin')
    } finally {
      setLoadingData(false)
    }
  }

  const handleCancelAppointment = async () => {
    if (!confirm('Bạn có chắc muốn hủy lịch khám này?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5129/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        alert('Hủy lịch khám thành công!')
        router.push('/patient/appointments')
      } else {
        const error = await response.json()
        alert(error.message || 'Không thể hủy lịch khám')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Có lỗi xảy ra khi hủy lịch khám')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      'Scheduled': { text: 'Đã đặt lịch', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'Pending': { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'Confirmed': { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'Completed': { text: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200' },
      'Cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200' }
    }
    const badge = badges[status as keyof typeof badges] || { text: status, color: 'bg-gray-100 text-gray-800 border-gray-200' }
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${badge.color}`}>
        {badge.text}
      </span>
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

  if (!appointment) {
    return null
  }

  return (
    <main>
      <Header />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-blue-900 mb-2">
                Chi Tiết Lịch Khám
              </h1>
              <p className="text-lg text-gray-700">
                Mã lịch khám: #{appointment.appointmentId}
              </p>
            </div>
            {getStatusBadge(appointment.status)}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Appointment Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Thông Tin Lịch Khám
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Ngày khám</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {(() => {
                          try {
                            const [year, month, day] = appointment.date.split('-').map(Number);
                            const date = new Date(year, month - 1, day);
                            return date.toLocaleDateString('vi-VN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            });
                          } catch (e) {
                            return 'Invalid Date';
                          }
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600">Giờ khám</p>
                      <p className="font-semibold text-gray-900">
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  Thông Tin Bác Sĩ
                </h2>

                {appointment.doctor ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Họ tên bác sĩ</p>
                      <p className="font-bold text-xl text-gray-900">BS. {appointment.doctor.name}</p>
                    </div>
                    
                    {appointment.doctor.specialtyName && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Chuyên khoa</p>
                        <p className="font-semibold text-gray-900">{appointment.doctor.specialtyName}</p>
                      </div>
                    )}


                  </div>
                ) : (
                  <p className="text-gray-500">Thông tin bác sĩ không có sẵn</p>
                )}
              </div>

            </div>

            {/* Right Column - Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Actions Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Hành Động</h2>
                <div className="space-y-3">
                  {(appointment.status === 'Scheduled' || appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
                    <button
                      onClick={handleCancelAppointment}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hủy lịch khám
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.print()}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    In thông tin
                  </button>

                  {appointment.status === 'Completed' && (
                    <a
                      href={`/results`}
                      className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                    >
                      Xem kết quả khám
                    </a>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Vui lòng đến trước giờ hẹn 15 phút</li>
                      <li>Mang theo CMND/CCCD</li>
                      <li>Liên hệ hotline nếu cần thay đổi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
