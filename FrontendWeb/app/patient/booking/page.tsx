'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
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
}

export default function BookingPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  
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

  const handleDoctorSelect = (doctorId: number) => {
    setSelectedDoctor(doctorId)
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
      
      const response = await fetch(`${API_URL}/booking/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          date: selectedDate,
          time: selectedTime
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(true)
        setTimeout(() => {
          // Chuyển đến trang thanh toán
          router.push(`/patient/payment/${data.appointmentId}`)
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Đặt lịch thất bại')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      setError('Lỗi khi đặt lịch khám')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
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

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Đặt Lịch Thành Công!</h2>
          <p className="text-gray-600">Đang chuyển đến trang thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <div className="text-sm ml-2 font-medium">Chọn Bác sĩ & Ngày</div>
            </div>
            
            <div className={`w-24 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <div className="text-sm ml-2 font-medium">Chọn Giờ</div>
            </div>
            
            <div className={`w-24 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <div className="text-sm ml-2 font-medium">Xác Nhận</div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
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
              {/* Select Specialty */}
              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-700">
                  Chọn Chuyên Khoa
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specialties.map((specialty) => (
                    <button
                      key={specialty.specialtyId}
                      onClick={() => handleSpecialtySelect(specialty.specialtyId)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedSpecialty === specialty.specialtyId
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      <h3 className="font-semibold text-lg">{specialty.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{specialty.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Doctor */}
              {selectedSpecialty && doctors.length > 0 && (
                <div>
                  <label className="block text-lg font-semibold mb-3 text-gray-700">
                    Chọn Bác Sĩ
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {doctors.map((doctor) => (
                      <button
                        key={doctor.doctorId}
                        onClick={() => handleDoctorSelect(doctor.doctorId)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedDoctor === doctor.doctorId
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl mr-4">
                            👨‍⚕️
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

              {/* Select Date */}
              {selectedDoctor && (
                <div>
                  <label className="block text-lg font-semibold mb-3 text-gray-700">
                    Chọn Ngày Khám
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}

              {selectedDoctor && selectedDate && (
                <button
                  onClick={handleNextStep}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Tiếp Theo
                </button>
              )}
            </div>
          )}

          {/* Step 2: Select Time Slot */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
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
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 hover:border-blue-400'
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
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
              <div className="bg-blue-50 p-6 rounded-lg space-y-3">
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
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
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
