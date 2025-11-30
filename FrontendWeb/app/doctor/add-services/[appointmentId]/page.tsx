'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'

interface Service {
  serviceId: number
  name: string
  price: number
  type: string
}

interface Appointment {
  appointmentId: number
  date: string
  time: string
  status: string
  patient: {
    patientId: number
    name: string
    phone: string
    dob: string
    gender: string
    address: string
  }
}

export default function AddServicesPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [appointmentId])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // Load appointment details
      const aptResponse = await fetch(`http://localhost:5129/api/medical/appointments?period=all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const appointments = await aptResponse.json()
      const apt = appointments.find((a: Appointment) => a.appointmentId === parseInt(appointmentId))
      setAppointment(apt)

      // Load all services
      const servicesResponse = await fetch('http://localhost:5129/api/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const servicesData = await servicesResponse.json()
      setServices(servicesData)

      // Load already selected services
      const selectedResponse = await fetch(`http://localhost:5129/api/medical/appointments/${appointmentId}/services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const selectedData = await selectedResponse.json()
      if (selectedData.services && selectedData.services.length > 0) {
        setSelectedServices(selectedData.services.map((s: Service) => s.serviceId))
      }
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceToggle = (serviceId: number) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      alert('Vui lòng chọn ít nhất một dịch vụ')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')

      const response = await fetch(`http://localhost:5129/api/medical/appointments/${appointmentId}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceIds: selectedServices,
          completeExamination: true
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Chỉ định dịch vụ thành công!\nTổng tiền: ${result.totalAmount.toLocaleString('vi-VN')} đ`)
        router.push('/doctor/patients')
      } else {
        alert('Lỗi khi chỉ định dịch vụ')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Lỗi khi chỉ định dịch vụ')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateTotal = () => {
    return services
      .filter(s => selectedServices.includes(s.serviceId))
      .reduce((sum, s) => sum + s.price, 0)
  }

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DoctorLayout>
    )
  }

  if (!appointment) {
    return (
      <DoctorLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Không tìm thấy lịch hẹn</p>
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ← Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Chỉ định dịch vụ khám</h1>
        </div>

        {/* Patient Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin bệnh nhân</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Họ tên</p>
              <p className="font-medium">{appointment.patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-medium">{appointment.patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ngày sinh</p>
              <p className="font-medium">{new Date(appointment.patient.dob).toLocaleDateString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Giới tính</p>
              <p className="font-medium">{appointment.patient.gender}</p>
            </div>
          </div>
        </div>

        {/* Services Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Chọn dịch vụ khám</h2>
          <div className="space-y-3">
            {services.map(service => (
              <label
                key={service.serviceId}
                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedServices.includes(service.serviceId)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.serviceId)}
                    onChange={() => handleServiceToggle(service.serviceId)}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-500">{service.type}</p>
                  </div>
                </div>
                <p className="font-semibold text-blue-600">
                  {service.price.toLocaleString('vi-VN')} đ
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Total & Submit */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Tổng chi phí</h2>
            <p className="text-2xl font-bold text-blue-600">
              {calculateTotal().toLocaleString('vi-VN')} đ
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedServices.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Đang xử lý...' : 'Hoàn tất & Gửi thanh toán'}
            </button>
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}
