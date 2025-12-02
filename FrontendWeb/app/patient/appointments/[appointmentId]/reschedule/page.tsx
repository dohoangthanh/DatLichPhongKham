'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Doctor {
  doctorId: number
  name: string
  phone: string
  imageUrl?: string
  specialty?: {
    specialtyId: number
    name: string
  }
}

interface Specialty {
  specialtyId: number
  name: string
}

interface AppointmentDetail {
  appointmentId: number
  date: string
  time: string
  status: string
  doctor?: {
    doctorId: number
    name: string
    specialtyName?: string
  }
}

export default function ReschedulePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const appointmentId = params?.appointmentId as string

  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])

  const [selectedSpecialty, setSelectedSpecialty] = useState<number>(0)
  const [selectedDoctor, setSelectedDoctor] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    } else if (user && appointmentId) {
      fetchAppointmentDetail()
      fetchSpecialties()
      fetchDoctors()
    }
  }, [user, loading, appointmentId])

  useEffect(() => {
    if (selectedSpecialty > 0) {
      const filtered = doctors.filter(d => d.specialty?.specialtyId === selectedSpecialty)
      setFilteredDoctors(filtered)
      // Reset selected doctor nếu không thuộc specialty mới chọn
      if (selectedDoctor > 0 && !filtered.find(d => d.doctorId === selectedDoctor)) {
        setSelectedDoctor(0)
        setSelectedTime('')
        setAvailableSlots([])
      }
    } else {
      setFilteredDoctors(doctors)
    }
  }, [selectedSpecialty, doctors, selectedDoctor])

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots()
    } else {
      setAvailableSlots([])
      setSelectedTime('')
    }
  }, [selectedDoctor, selectedDate])

  const fetchAppointmentDetail = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5129/api/appointments/${appointmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAppointment(data)
        
        // Pre-fill current values
        setSelectedDate(data.date)
        setSelectedTime(data.time)
        if (data.doctor) {
          setSelectedDoctor(data.doctor.doctorId)
        }
      }
    } catch (error) {
      console.error('Error fetching appointment:', error)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const response = await fetch('http://localhost:5129/api/specialties')
      if (response.ok) {
        const data = await response.json()
        setSpecialties(data)
      }
    } catch (error) {
      console.error('Error fetching specialties:', error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5129/api/doctors')
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Fetched doctors:', data)
        console.log('📋 Sample doctor:', data[0])
        setDoctors(data)
        setFilteredDoctors(data) // Initialize filtered doctors
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const fetchAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return
    
    setLoadingSlots(true)
    try {
      const response = await fetch(`http://localhost:5129/api/booking/slots/${selectedDoctor}/${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data)
      }
    } catch (error) {
      console.error('Error fetching available slots:', error)
      alert('Lỗi khi tải khung giờ khám')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert('Vui lòng chọn đầy đủ thông tin')
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5129/api/appointments/${appointmentId}/reschedule`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          doctorId: selectedDoctor,
          reason: reason || 'Bệnh nhân yêu cầu đổi lịch'
        })
      })

      if (response.ok) {
        alert('Đổi lịch thành công!')
        router.push(`/patient/appointments/${appointmentId}`)
      } else {
        const error = await response.json()
        alert(error.message || 'Không thể đổi lịch')
      }
    } catch (error) {
      console.error('Error rescheduling:', error)
      alert('Có lỗi xảy ra khi đổi lịch')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !user || !appointment) {
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
    <main className="min-h-screen bg-gray-50">
      <Header />

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </button>
            <h1 className="text-3xl font-bold text-blue-700">Đổi Lịch Khám</h1>
            <p className="text-gray-600 mt-2">Thay đổi thông tin lịch hẹn của bạn</p>
          </div>

          {/* Current Appointment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
            <h3 className="font-bold text-lg mb-3 text-blue-900">Thông tin lịch hiện tại:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Ngày khám:</span>
                <p className="text-blue-900 font-semibold">{new Date(appointment.date).toLocaleDateString('vi-VN')}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Giờ khám:</span>
                <p className="text-blue-900 font-semibold">{appointment.time}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Bác sĩ:</span>
                <p className="text-blue-900 font-semibold">BS. {appointment.doctor?.name}</p>
              </div>
            </div>
          </div>


          {/* Reschedule Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Specialty Selection */}
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Chuyên khoa <span className="text-gray-500 font-normal"></span>
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value={0}>Tất cả chuyên khoa</option>
                  {specialties.map(s => (
                    <option key={s.specialtyId} value={s.specialtyId}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Chọn bác sĩ <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value={0}>-- Chọn bác sĩ --</option>
                  {filteredDoctors.map(d => (
                    <option key={d.doctorId} value={d.doctorId}>
                      BS. {d.name} {d.specialty ? `- ${d.specialty.name}` : ''}
                    </option>
                  ))}
                </select>
                {(filteredDoctors.length === 0 && selectedSpecialty > 0) && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Không có bác sĩ nào thuộc chuyên khoa này</p>
                )}
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Ngày khám mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Giờ khám mới <span className="text-red-500">*</span>
                </label>
                {loadingSlots ? (
                  <div className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg bg-blue-50 text-center">
                    <span className="text-blue-600">⏳ Đang tải khung giờ...</span>
                  </div>
                ) : (
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                    disabled={!selectedDoctor || !selectedDate || availableSlots.length === 0}
                  >
                    <option value="">
                      {!selectedDoctor || !selectedDate 
                        ? '-- Vui lòng chọn bác sĩ và ngày --' 
                        : availableSlots.length === 0
                        ? '-- Không có giờ trống --'
                        : '-- Chọn giờ khám --'}
                    </option>
                    {availableSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                )}
                {selectedDate && selectedDoctor && availableSlots.length === 0 && !loadingSlots && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ Không có khung giờ khám trống. Lưu ý: Chỉ đặt được lịch từ 2 giờ sau thời điểm hiện tại.
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">
                  Lý do đổi lịch <span className="text-gray-500 font-normal"></span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Vui lòng cho biết lý do đổi lịch..."
                  className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                  disabled={isSubmitting}
                >
                  ← Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || !selectedDoctor || !selectedDate || !selectedTime}
                >
                  {isSubmitting ? '⏳ Đang xử lý...' : '✓ Xác nhận đổi lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
