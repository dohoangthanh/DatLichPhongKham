'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChatbotBubble from '@/components/ChatbotBubble'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface Specialty {
  specialtyId: number
  name: string
  description: string
}

interface Doctor {
  doctorId: number
  name: string
  phone: string
  imageUrl?: string
}

interface WorkShift {
  shiftId: number
  doctorId: number
  date: string
  startTime: string
  endTime: string
}

export default function BookingPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [doctorWorkShifts, setDoctorWorkShifts] = useState<WorkShift[]>([])
  
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Patient')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`${API_URL}/booking/specialties`)
      
      if (response.ok) {
        const data = await response.json()
        setSpecialties(data)
      }
    } catch (error) {
      console.error('Error fetching specialties:', error)
    }
  }

  const fetchDoctors = async (specialtyId: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/booking/doctors/${specialtyId}`)
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableSlots = async (doctorId: number, date: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/booking/slots/${doctorId}/${date}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data)
        if (data.length === 0) {
          setError('Không có lịch trống cho ngày này')
        }
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setError('Lỗi khi tải lịch trống')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpecialtySelect = (specialtyId: number) => {
    setSelectedSpecialty(specialtyId)
    setSelectedDoctor(null)
    setDoctors([])
    fetchDoctors(specialtyId)
  }

  const handleDoctorSelect = async (doctorId: number) => {
    setSelectedDoctor(doctorId)
    setSelectedDate('')
    setSelectedTime('')
    setAvailableSlots([])
    // Fetch work shifts for selected doctor
    await fetchDoctorWorkShifts(doctorId)
  }

  const fetchDoctorWorkShifts = async (doctorId: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/schedule/workshift/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Lọc chỉ lấy các ngày từ hôm nay trở đi
        const today = new Date().toISOString().split('T')[0]
        const futureShifts = data.filter((shift: WorkShift) => shift.date >= today)
        setDoctorWorkShifts(futureShifts)
      }
    } catch (error) {
      console.error('Error fetching doctor work shifts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    setAvailableSlots([])
    setError('')
    if (selectedDoctor && date) {
      fetchAvailableSlots(selectedDoctor, date)
    }
  }

  const handleNextStep = () => {
    if (step === 1 && selectedDoctor && selectedDate) {
      setStep(2)
    }
  }

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !token) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      const requestData = {
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime
      }
      
      const response = await fetch(`${API_URL}/booking/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      const responseText = await response.text()

      if (response.ok) {
        const data = JSON.parse(responseText)
        const appointmentId = data.appointmentId || data
        setSuccess(true)
        setTimeout(() => {
          // Chuyển đến trang chi tiết lịch khám
          router.push(`/patient/appointments/${appointmentId}`)
        }, 1500)
      } else {
        let errorMessage = 'Đặt lịch thất bại'
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.message || errorData.title || errorMessage
        } catch (e) {
          errorMessage = responseText || errorMessage
        }
        setError(errorMessage)
      }
    } catch (error) {
      setError(`Lỗi khi đặt lịch khám: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'Patient') {
    return null
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-2xl border-t-4 border-green-500">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent mb-2">Đặt Lịch Thành Công!</h2>
          <p className="text-gray-600">Vui lòng chờ trong giây lát...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className="text-sm ml-2 font-medium">Chọn Bác sĩ & Ngày</div>
            </div>
            
            <div className={`w-24 h-1 mx-4 ${step >= 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gray-300'}`}></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <div className="text-sm ml-2 font-medium">Chọn Giờ</div>
            </div>
            
            <div className={`w-24 h-1 mx-4 ${step >= 3 ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : 'bg-gray-300'}`}></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <div className="text-sm ml-2 font-medium">Xác Nhận</div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Đặt Lịch Khám Bệnh Trực Tuyến
          </h1>


          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Step 1: Select Doctor & Date */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Select Specialty - Ẩn khi đã chọn */}
              {!selectedSpecialty && (
                <div>
                  <label className="block text-lg font-semibold mb-3 text-gray-700">
                    Chọn Chuyên Khoa
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specialties.map((specialty) => (
                      <button
                        key={specialty.specialtyId}
                        onClick={() => handleSpecialtySelect(specialty.specialtyId)}
                        className="p-4 rounded-lg border-2 text-left transition-all border-gray-300 hover:border-cyan-400 hover:shadow-md"
                      >
                        <h3 className="font-semibold text-lg">{specialty.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{specialty.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Select Doctor - Hiển thị sau khi chọn khoa */}
              {selectedSpecialty && doctors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-lg font-semibold text-gray-700">
                      Chọn Bác Sĩ
                    </label>
                    <button
                      onClick={() => {
                        setSelectedSpecialty(null)
                        setSelectedDoctor(null)
                        setDoctors([])
                        setSelectedDate('')
                        setSelectedTime('')
                        setAvailableSlots([])
                        setDoctorWorkShifts([])
                      }}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      ← Quay lại
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doctor) => (
                      <button
                        key={doctor.doctorId}
                        onClick={() => handleDoctorSelect(doctor.doctorId)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedDoctor === doctor.doctorId
                            ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg shadow-cyan-500/20'
                            : 'border-gray-300 hover:border-cyan-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center overflow-hidden mr-4 border-4 border-cyan-200">
                            {doctor.imageUrl ? (
                              <img 
                                src={doctor.imageUrl.startsWith('http') ? doctor.imageUrl : `http://localhost:5129${doctor.imageUrl}`}
                                alt={doctor.name}
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
                            <h3 className="font-semibold text-lg">{doctor.name}</h3>
                            <p className="text-sm text-gray-600">{doctor.phone}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Select Date - Dropdown */}
              {selectedDoctor && (
                <div>
                  <label className="block text-lg font-semibold mb-3 text-gray-700">
                    Chọn Ngày Khám
                  </label>
                  {isLoading ? (
                    <div className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-center">
                      <span className="text-gray-500">⏳ Đang tải lịch làm việc...</span>
                    </div>
                  ) : doctorWorkShifts.length > 0 ? (
                    <select
                      value={selectedDate}
                      onChange={(e) => handleDateSelect(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all text-base"
                    >
                      <option value="">-- Chọn ngày khám --</option>
                      {doctorWorkShifts.map((shift) => {
                        const date = new Date(shift.date)
                        const displayDate = date.toLocaleDateString('vi-VN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                        return (
                          <option key={shift.shiftId} value={shift.date}>
                            {displayDate} ({shift.startTime} - {shift.endTime})
                          </option>
                        )
                      })}
                    </select>
                  ) : (
                    <div className="w-full p-3 border-2 border-red-300 rounded-lg bg-red-50">
                      <p className="text-red-600 text-center">⚠️ Bác sĩ chưa đăng ký lịch làm việc</p>
                    </div>
                  )}
                </div>
              )}

              {selectedDoctor && selectedDate && (
                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
                >
                  Tiếp Theo
                </button>
              )}
            </div>
          )}

          {/* Step 2: Select Time Slot */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg mb-6 border-l-4 border-cyan-500">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Bác sĩ:</span> {doctors.find(d => d.doctorId === selectedDoctor)?.name}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Ngày khám:</span> {selectedDate}
                </p>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">
                  Chọn Giờ Khám
                </label>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-3 px-4 rounded-lg border-2 font-semibold transition-all ${
                          selectedTime === slot
                            ? 'border-cyan-500 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                            : 'border-gray-300 hover:border-cyan-400'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Không có lịch trống</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Quay Lại
                </button>
                {selectedTime && (
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
                  >
                    Tiếp Theo
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6 rounded-lg space-y-3 border-l-4 border-cyan-500">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Thông Tin Đặt Lịch</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Chuyên khoa</p>
                    <p className="font-semibold">{specialties.find(s => s.specialtyId === selectedSpecialty)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bác sĩ</p>
                    <p className="font-semibold">{doctors.find(d => d.doctorId === selectedDoctor)?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày khám</p>
                    <p className="font-semibold">{selectedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giờ khám</p>
                    <p className="font-semibold">{selectedTime}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Quay Lại
                </button>
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:shadow-none"
                >
                  {isLoading ? 'Đang xử lý...' : 'Xác Nhận Đặt Lịch'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <ChatbotBubble />
    </main>
  )
}
