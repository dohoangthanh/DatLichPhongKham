'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FeedbackModal from '@/components/FeedbackModal'
import ChatbotBubble from '@/components/ChatbotBubble'
import { patientMedicalApi } from '@/services/patientApi'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface Appointment {
  appointmentId: number
  date?: string
  time?: string
  status: string
  doctor: {
    doctorId: number
    name: string
    phone: string
    imageUrl?: string
  } | null
  specialty: {
    specialtyId: number
    name: string
  } | null
  payment?: {
    paymentId: number
    status: string
    totalAmount: number
  } | null
  hasFeedback?: boolean
}

interface LabResult {
  resultId: number
  resultDetails: string
  resultDate: string
}

interface MedicalRecord {
  recordId: number
  symptoms: string
  diagnosis: string
  treatment: string
  createdDate: string
  appointment: {
    appointmentId: number
    date: string
    time: string
    doctor: {
      doctorId: number
      name: string
      specialty: string
      imageUrl?: string
    }
  }
  labResults: LabResult[]
}

export default function HistoryPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, scheduled, completed, cancelled
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean
    appointmentId: number
    doctorId: number
    doctorName: string
  }>({
    isOpen: false,
    appointmentId: 0,
    doctorId: 0,
    doctorName: ''
  })
  const [medicalRecordModal, setMedicalRecordModal] = useState<{
    isOpen: boolean
    appointmentId: number
    record: MedicalRecord | null
    loading: boolean
    error: string | null
  }>({
    isOpen: false,
    appointmentId: 0,
    record: null,
    loading: false,
    error: null
  })

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
        console.log('Appointments data:', data)
        console.log('First appointment:', data[0])
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
      'Scheduled': { bg: 'bg-gradient-to-r from-cyan-100 to-blue-100', text: 'text-blue-800', label: 'Đã đặt lịch' },
      'Completed': { bg: 'bg-gradient-to-r from-green-100 to-emerald-100', text: 'text-green-800', label: 'Đã hoàn thành' },
      'Cancelled': { bg: 'bg-gradient-to-r from-red-100 to-pink-100', text: 'text-red-800', label: 'Đã hủy' }
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

  const handleViewMedicalRecord = async (appointmentId: number) => {
    setMedicalRecordModal({
      isOpen: true,
      appointmentId,
      record: null,
      loading: true,
      error: null
    })

    try {
      const record = await patientMedicalApi.getMyMedicalRecord(appointmentId)
      setMedicalRecordModal(prev => ({
        ...prev,
        record,
        loading: false
      }))
    } catch (error: any) {
      setMedicalRecordModal(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Không thể tải kết quả khám'
      }))
    }
  }

  const closeMedicalRecordModal = () => {
    setMedicalRecordModal({
      isOpen: false,
      appointmentId: 0,
      record: null,
      loading: false,
      error: null
    })
  }

  const parseLabResults = (resultDetails: string) => {
    try {
      return JSON.parse(resultDetails)
    } catch {
      return null
    }
  }

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
      
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lịch Sử Khám Bệnh
            </h1>
            <button
              onClick={() => router.push('/patient/booking')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
            >
              + Đặt Lịch Mới
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('scheduled')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'scheduled'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã đặt
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'completed'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Đã khám
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'cancelled'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
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
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
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
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center overflow-hidden border-4 border-gradient-to-r from-cyan-200 to-blue-300">
                          {appointment.doctor?.imageUrl ? (
                            <img 
                              src={appointment.doctor.imageUrl.startsWith('http') ? appointment.doctor.imageUrl : `http://localhost:5129${appointment.doctor.imageUrl}`}
                              alt={appointment.doctor.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl">👨‍⚕️</span>';
                              }}
                            />
                          ) : (
                            <span className="text-3xl">👨‍⚕️</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {appointment.doctor?.name || 'BS.'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {appointment.specialty?.name || ''}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📅</span>
                          <div>
                            <p className="text-xs text-gray-500">Ngày khám</p>
                            <p className="font-semibold text-gray-800">
                              {appointment.date ? (() => {
                                try {
                                  const dateStr = String(appointment.date);
                                  const [year, month, day] = dateStr.split('-').map(Number);
                                  return new Date(year, month - 1, day).toLocaleDateString('vi-VN');
                                } catch (e) {
                                  return appointment.date;
                                }
                              })() : 'Invalid Date'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🕐</span>
                          <div>
                            <p className="text-xs text-gray-500">Giờ khám</p>
                            <p className="font-semibold text-gray-800">
                              {appointment.time ? String(appointment.time).substring(0, 5) : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-2xl">📞</span>
                          <div>
                            <p className="text-xs text-gray-500">Liên hệ</p>
                            <p className="font-semibold text-gray-800">
                              {appointment.doctor?.phone || ''}
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
                    <div className="mt-6 pt-6 bg-gradient-to-t from-gray-50/50 via-transparent to-transparent flex gap-3">
                      <button
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                        onClick={() => router.push(`/patient/appointments/${appointment.appointmentId}`)}
                      >
                        Xem Chi Tiết
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        onClick={async () => {
                          if (!confirm('Bạn có chắc muốn hủy lịch khám này?')) return;
                          
                          try {
                            const response = await fetch(`${API_URL}/appointments/${appointment.appointmentId}/cancel`, {
                              method: 'PUT',
                              headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                              }
                            });
                            
                            if (response.ok) {
                              alert('Hủy lịch khám thành công!');
                              fetchAppointments();
                            } else {
                              const error = await response.json();
                              alert(error.message || 'Không thể hủy lịch khám');
                            }
                          } catch (error) {
                            console.error('Error cancelling appointment:', error);
                            alert('Có lỗi xảy ra khi hủy lịch khám');
                          }
                        }}
                      >
                        Hủy Lịch
                      </button>
                    </div>
                  )}

                  {appointment.status === 'Completed' && (
                    <div className="mt-6 pt-6 bg-gradient-to-t from-gray-50/50 via-transparent to-transparent">
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                          onClick={() => handleViewMedicalRecord(appointment.appointmentId)}
                        >
                          Xem Kết Quả Khám
                        </button>
                        <button
                          className={`px-4 py-2 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                            appointment.payment?.status === 'Paid'
                              ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                          }`}
                          onClick={() => router.push(`/patient/payment/${appointment.appointmentId}`)}
                        >
                          {appointment.payment?.status === 'Paid' ? 'Xem lại Hóa đơn' : 'Thanh Toán'}
                        </button>
                        <button
                          className={`px-4 py-2 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${
                            appointment.hasFeedback
                              ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700'
                          }`}
                          onClick={() => {
                            if (appointment.doctor) {
                              if (appointment.hasFeedback) {
                                router.push('/patient/feedback');
                              } else {
                                setFeedbackModal({
                                  isOpen: true,
                                  appointmentId: appointment.appointmentId,
                                  doctorId: appointment.doctor.doctorId,
                                  doctorName: appointment.doctor.name
                                });
                              }
                            }
                          }}
                        >
                          {appointment.hasFeedback ? 'Xem Đánh giá' : 'Đánh Giá'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
        appointmentId={feedbackModal.appointmentId}
        doctorId={feedbackModal.doctorId}
        doctorName={feedbackModal.doctorName}
        token={token || ''}
        onSuccess={fetchAppointments}
      />

      {/* Medical Record Modal */}
      {medicalRecordModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-5 flex items-center justify-between shadow-sm">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Kết Quả Khám Bệnh & Xét Nghiệm</h2>
              <button
                onClick={closeMedicalRecordModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {medicalRecordModal.loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
              )}

              {medicalRecordModal.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-3">⚠️</div>
                  <p className="text-red-800 font-semibold">{medicalRecordModal.error}</p>
                </div>
              )}

              {medicalRecordModal.record && (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-gradient-to-r from-cyan-400 to-blue-600 shadow-lg">
                        {medicalRecordModal.record.appointment.doctor.imageUrl ? (
                          <img 
                            src={medicalRecordModal.record.appointment.doctor.imageUrl.startsWith('http') ? medicalRecordModal.record.appointment.doctor.imageUrl : `http://localhost:5129${medicalRecordModal.record.appointment.doctor.imageUrl}`}
                            alt={medicalRecordModal.record.appointment.doctor.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<span class="text-3xl text-blue-600">👨‍⚕️</span>';
                            }}
                          />
                        ) : (
                          <span className="text-3xl text-blue-600">👨‍⚕️</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          PHÒNG KHÁM ĐA KHOA
                        </h3>
                        <p className="text-sm text-gray-600">Kết Quả Khám Bệnh & Xét Nghiệm</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Ngày khám:</span>
                        <span className="ml-2 font-semibold">
                          {new Date(medicalRecordModal.record.appointment.date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Bác sĩ:</span>
                        <span className="ml-2 font-semibold">
                          ThS.BS. {medicalRecordModal.record.appointment.doctor.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Diagnosis Section */}
                  <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-100 to-blue-100 px-6 py-4 shadow-sm">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">Chẩn Đoán và Kết Luận</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Chẩn đoán:</p>
                        <p className="text-gray-900">{medicalRecordModal.record.diagnosis || 'Chưa có thông tin'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Lời dặn:</p>
                        <p className="text-gray-900">{medicalRecordModal.record.treatment || 'Chưa có thông tin'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lab Results Section */}
                  {medicalRecordModal.record.labResults && medicalRecordModal.record.labResults.length > 0 && (
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden mt-6">
                      <div className="bg-gradient-to-r from-cyan-100 to-blue-100 px-6 py-4 shadow-sm">
                        <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">Kết Quả Xét Nghiệm</h3>
                      </div>
                      <div className="p-6">
                        {medicalRecordModal.record.labResults.map((labResult) => {
                          const parsedResults = parseLabResults(labResult.resultDetails)
                          
                          return (
                            <div key={labResult.resultId} className="mb-6 last:mb-0">
                              {parsedResults && Array.isArray(parsedResults) ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                          TÊN XÉT NGHIỆM
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                                          KẾT QUẢ
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                                          ĐƠN VỊ
                                        </th>
                                        <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700">
                                          GIÁ TRỊ THAM CHIẾU
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {parsedResults.map((result: any, index: number) => {
                                        const isAbnormal = result.isAbnormal || false
                                        return (
                                          <tr key={index} className={isAbnormal ? 'bg-red-50' : ''}>
                                            <td className="border border-gray-300 px-4 py-2">
                                              {result.testName || result.name}
                                            </td>
                                            <td className={`border border-gray-300 px-4 py-2 text-center font-semibold ${
                                              isAbnormal ? 'text-red-600' : 'text-gray-900'
                                            }`}>
                                              {result.value || result.result}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                              {result.unit || result.units || 'mmol/L'}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 text-center">
                                              {result.referenceRange || result.reference || '-'}
                                            </td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                  <p className="text-xs text-gray-500 mt-2">
                                    * Các chỉ số bất thường được <span className="text-red-600 font-semibold">tô đậm màu đỏ</span>.
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-gray-50 p-4 rounded">
                                  <p className="text-gray-700 whitespace-pre-wrap">{labResult.resultDetails}</p>
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                Ngày xét nghiệm: {new Date(labResult.resultDate).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={closeMedicalRecordModal}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Chatbot Bubble */}
      <ChatbotBubble />
    </main>
  )
}
