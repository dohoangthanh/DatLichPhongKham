'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

interface Appointment {
  appointmentId: number
  patientId: number
  doctorId: number
  serviceId: number
  appointmentDate: string
  status: string
  notes: string
  createdDate: string
  doctor?: {
    doctorId: number
    fullName: string
    phone: string
    specialty?: {
      specialtyName: string
    }
  }
  service?: {
    serviceId: number
    serviceName: string
    price: number
  }
}

export default function AppointmentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    } else if (user) {
      fetchAppointments()
    }
  }, [user, loading, router])

  const fetchAppointments = async () => {
    try {
      setLoadingData(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5129/api/appointments/my-appointments', {
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
      setLoadingData(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: number) => {
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
        fetchAppointments()
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
      'Pending': { text: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      'Confirmed': { text: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      'Completed': { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      'Cancelled': { text: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    }
    const badge = badges[status as keyof typeof badges] || { text: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true
    return apt.status.toLowerCase() === filter
  })

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <main>
      <Header />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-12">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Lịch Khám Của Tôi
            </h1>
            <p className="text-lg text-gray-700">
              Quản lý và theo dõi các lịch khám của bạn
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-6 bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'pending', label: 'Chờ xác nhận' },
              { key: 'confirmed', label: 'Đã xác nhận' },
              { key: 'completed', label: 'Hoàn thành' },
              { key: 'cancelled', label: 'Đã hủy' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Appointments List */}
      <section className="py-12 bg-gray-50 min-h-screen">
        <div className="max-w-screen-xl mx-auto px-6">
          {loadingData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải danh sách lịch khám...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có lịch khám nào</h3>
              <p className="text-gray-600 mb-6">Bạn chưa có lịch khám nào trong danh sách</p>
              <a
                href="/patient/booking"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Đặt lịch khám ngay
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAppointments.map(appointment => (
                <div key={appointment.appointmentId} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            #{appointment.appointmentId}
                          </h3>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          Đặt lịch: {new Date(appointment.createdDate).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/patient/appointments/${appointment.appointmentId}`)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Xem chi tiết →
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      {/* Doctor Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">Bác sĩ khám</p>
                          <p className="font-semibold text-gray-900">
                            {appointment.doctor ? `BS. ${appointment.doctor.fullName}` : 'N/A'}
                          </p>
                          {appointment.doctor?.specialty && (
                            <p className="text-sm text-gray-600 mt-1">
                              {appointment.doctor.specialty.specialtyName}
                            </p>
                          )}
                          {appointment.doctor?.phone && (
                            <p className="text-sm text-gray-600">
                              SĐT: {appointment.doctor.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Appointment Info */}
                      <div>
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Thời gian khám</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(appointment.appointmentDate).toLocaleString('vi-VN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {appointment.service && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Dịch vụ</p>
                            <p className="font-semibold text-gray-900">{appointment.service.serviceName}</p>
                            <p className="text-blue-600 font-bold">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(appointment.service.price)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600 mb-1">Ghi chú</p>
                        <p className="text-gray-800">{appointment.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.appointmentId)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          Hủy lịch khám
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/patient/appointments/${appointment.appointmentId}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
