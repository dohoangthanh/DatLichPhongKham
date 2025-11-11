'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface Appointment {
  appointmentId: number
  date: string
  time: string
  status: string
  doctor: {
    doctorId: number
    name: string
    phone: string
  }
  specialty: {
    specialtyId: number
    name: string
  }
}

export default function HistoryPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, scheduled, completed, cancelled

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Patient')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (token && user?.role === 'Patient') {
      fetchAppointments()
    }
  }, [token, user])

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/booking/my-appointments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      'Scheduled': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã đặt lịch' },
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã hoàn thành' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' }
    }
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true
    return app.status.toLowerCase() === filter.toLowerCase()
  })

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'Patient') {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Lịch Sử Khám Bệnh
            </h1>
            <button
              onClick={() => router.push('/patient/booking')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              + Đặt Lịch Mới
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('scheduled')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'scheduled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã đặt
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'completed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã khám
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  filter === 'cancelled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã hủy
              </button>
            </div>
          </div>

          {/* Appointments List */}
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Chưa có lịch khám nào
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa có lịch khám bệnh nào trong hệ thống
              </p>
              <button
                onClick={() => router.push('/patient/booking')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Đặt Lịch Ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.appointmentId}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                          👨‍⚕️
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {appointment.doctor.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {appointment.specialty.name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📅</span>
                          <div>
                            <p className="text-xs text-gray-500">Ngày khám</p>
                            <p className="font-semibold text-gray-800">
                              {new Date(appointment.date).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🕐</span>
                          <div>
                            <p className="text-xs text-gray-500">Giờ khám</p>
                            <p className="font-semibold text-gray-800">
                              {appointment.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📞</span>
                          <div>
                            <p className="text-xs text-gray-500">Liên hệ</p>
                            <p className="font-semibold text-gray-800">
                              {appointment.doctor.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>

                  {appointment.status === 'Scheduled' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                      <button
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        onClick={() => {
                          // TODO: Implement view details
                          alert('Xem chi tiết')
                        }}
                      >
                        Xem Chi Tiết
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        onClick={() => {
                          // TODO: Implement cancel appointment
                          if (confirm('Bạn có chắc muốn hủy lịch khám này?')) {
                            alert('Hủy lịch khám')
                          }
                        }}
                      >
                        Hủy Lịch
                      </button>
                    </div>
                  )}

                  {appointment.status === 'Completed' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                      <button
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        onClick={() => {
                          // TODO: Implement view medical record
                          alert('Xem kết quả khám')
                        }}
                      >
                        Xem Kết Quả Khám
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
                        onClick={() => {
                          // TODO: Implement feedback
                          alert('Đánh giá dịch vụ')
                        }}
                      >
                        Đánh Giá
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
