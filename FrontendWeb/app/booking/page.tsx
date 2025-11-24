'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { patientApi } from '@/services/patientApi'

interface Specialty {
  specialtyId: number
  specialtyName: string
}

interface Doctor {
  doctorId: number
  fullName: string
  specialtyId: number
  specialty?: Specialty
}

interface Service {
  serviceId: number
  serviceName: string
  price: number
}

export default function BookingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  
  const [formData, setFormData] = useState({
    specialtyId: '',
    doctorId: '',
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    } else if (user) {
      fetchData()
    }
  }, [user, loading, router])

  const fetchData = async () => {
    try {
      const [specialtiesData, doctorsData, servicesData] = await Promise.all([
        patientApi.specialties.getAll(),
        patientApi.doctors.getAll(),
        patientApi.services.getAll()
      ])
      setSpecialties(specialtiesData)
      setDoctors(doctorsData)
      setServices(servicesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    if (formData.specialtyId) {
      const filtered = doctors.filter(d => d.specialtyId.toString() === formData.specialtyId)
      setFilteredDoctors(filtered)
    } else {
      setFilteredDoctors(doctors)
    }
  }, [formData.specialtyId, doctors])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      // Combine date and time
      const appointmentDateTime = `${formData.appointmentDate}T${formData.appointmentTime}:00`
      
      await patientApi.appointments.create({
        doctorId: parseInt(formData.doctorId),
        serviceId: parseInt(formData.serviceId),
        appointmentDate: appointmentDateTime,
        notes: formData.notes
      })
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/patient/appointments')
      }, 2000)
    } catch (error: any) {
      console.error('Error creating appointment:', error)
      alert(error.response?.data?.message || 'Đặt lịch thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

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

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ]

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <main>
      <Header />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Đặt Lịch Khám Bệnh
            </h1>
            <p className="text-lg text-gray-700">
              Chọn bác sĩ và thời gian phù hợp để đặt lịch khám
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <svg className="w-16 h-16 text-green-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-green-900 mb-2">Đặt Lịch Thành Công!</h2>
              <p className="text-green-700 mb-4">Chúng tôi sẽ liên hệ xác nhận trong thời gian sớm nhất.</p>
              <p className="text-sm text-gray-600">Đang chuyển hướng...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-8">
              {/* Step Indicator */}
              <div className="flex justify-between mb-8">
                <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} flex items-center justify-center mx-auto mb-2 font-bold`}>
                    1
                  </div>
                  <span className="text-sm font-medium">Chọn chuyên khoa & bác sĩ</span>
                </div>
                <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} flex items-center justify-center mx-auto mb-2 font-bold`}>
                    2
                  </div>
                  <span className="text-sm font-medium">Chọn thời gian</span>
                </div>
                <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'} flex items-center justify-center mx-auto mb-2 font-bold`}>
                    3
                  </div>
                  <span className="text-sm font-medium">Xác nhận</span>
                </div>
              </div>

              {/* Step 1: Select Specialty & Doctor */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Chuyên khoa <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="specialtyId"
                      value={formData.specialtyId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn chuyên khoa</option>
                      {specialties.map(specialty => (
                        <option key={specialty.specialtyId} value={specialty.specialtyId}>
                          {specialty.specialtyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Bác sĩ <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleChange}
                      required
                      disabled={!formData.specialtyId}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Chọn bác sĩ</option>
                      {filteredDoctors.map(doctor => (
                        <option key={doctor.doctorId} value={doctor.doctorId}>
                          BS. {doctor.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Dịch vụ khám <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn dịch vụ</option>
                      {services.map(service => (
                        <option key={service.serviceId} value={service.serviceId}>
                          {service.serviceName} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.specialtyId || !formData.doctorId || !formData.serviceId}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Tiếp theo
                  </button>
                </div>
              )}

              {/* Step 2: Select Time */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Ngày khám <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      min={today}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Giờ khám <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, appointmentTime: time }))}
                          className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                            formData.appointmentTime === time
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-500'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Quay lại
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={!formData.appointmentDate || !formData.appointmentTime}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Tiếp theo
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin đặt lịch</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chuyên khoa:</span>
                        <span className="font-medium">{specialties.find(s => s.specialtyId.toString() === formData.specialtyId)?.specialtyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bác sĩ:</span>
                        <span className="font-medium">BS. {doctors.find(d => d.doctorId.toString() === formData.doctorId)?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dịch vụ:</span>
                        <span className="font-medium">{services.find(s => s.serviceId.toString() === formData.serviceId)?.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày khám:</span>
                        <span className="font-medium">{new Date(formData.appointmentDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giờ khám:</span>
                        <span className="font-medium">{formData.appointmentTime}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Triệu chứng, tiền sử bệnh..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={submitting}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
