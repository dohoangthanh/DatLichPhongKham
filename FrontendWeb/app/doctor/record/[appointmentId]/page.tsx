'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface Patient {
  patientId: number
  name: string
  phone: string
  dob: string
  gender: string
  address: string
}

interface Appointment {
  appointmentId: number
  date: string
  time: string
  status: string
  patient: Patient
}

interface LabResult {
  resultDetails: string
  resultDate: string
}

interface MedicalRecord {
  recordId: number
  symptoms: string
  diagnosis: string
  treatment: string
  appointmentId: number
  labResults: LabResult[]
}

export default function UpdateMedicalRecordPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [existingRecord, setExistingRecord] = useState<MedicalRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    symptoms: '',
    diagnosis: '',
    treatment: '',
  })

  const [labResults, setLabResults] = useState<LabResult[]>([
    { resultDetails: '', resultDate: new Date().toISOString().split('T')[0] }
  ])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && appointmentId) {
      fetchAppointmentDetails(token)
      fetchExistingRecord(token)
    }
  }, [appointmentId])

  const fetchAppointmentDetails = async (authToken: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Không thể tải thông tin lịch khám')
      }

      const data = await response.json()
      setAppointment(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingRecord = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/medical/records`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        const records = await response.json()
        const record = records.find((r: any) => r.appointmentId === parseInt(appointmentId))
        
        if (record) {
          setExistingRecord(record)
          setFormData({
            symptoms: record.symptoms || '',
            diagnosis: record.diagnosis || '',
            treatment: record.treatment || '',
          })
          
          if (record.labResults && record.labResults.length > 0) {
            setLabResults(record.labResults.map((lr: any) => ({
              resultDetails: lr.resultDetails || '',
              resultDate: lr.resultDate ? new Date(lr.resultDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            })))
          }
        }
      }
    } catch (err) {
      console.error('Error fetching existing record:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLabResultChange = (index: number, field: keyof LabResult, value: string) => {
    const updatedLabResults = [...labResults]
    updatedLabResults[index] = {
      ...updatedLabResults[index],
      [field]: value
    }
    setLabResults(updatedLabResults)
  }

  const addLabResult = () => {
    setLabResults([...labResults, { resultDetails: '', resultDate: new Date().toISOString().split('T')[0] }])
  }

  const removeLabResult = (index: number) => {
    if (labResults.length > 1) {
      setLabResults(labResults.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.symptoms || !formData.diagnosis) {
      setError('Vui lòng nhập triệu chứng và chẩn đoán')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      
      const authToken = localStorage.getItem('token')
      if (!authToken) {
        throw new Error('Phiên đăng nhập đã hết hạn')
      }

      const filteredLabResults = labResults
        .filter(lab => lab.resultDetails.trim() !== '')
        .map(lab => ({
          resultDetails: lab.resultDetails,
          resultDate: lab.resultDate ? new Date(lab.resultDate).toISOString() : new Date().toISOString()
        }))

      // If existing record, update it
      if (existingRecord) {
        const updateData = {
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
        }

        const response = await fetch(`${API_URL}/medical/records/${existingRecord.recordId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(updateData)
        })

        if (!response.ok) {
          throw new Error('Không thể cập nhật bệnh án')
        }

        setSuccess('Cập nhật bệnh án thành công!')
      } else {
        // Create new record
        const requestData = {
          appointmentId: parseInt(appointmentId),
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          treatment: formData.treatment,
          labResults: filteredLabResults.length > 0 ? filteredLabResults : null
        }

        const response = await fetch(`${API_URL}/medical/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(requestData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Không thể lưu bệnh án')
        }

        setSuccess('Tạo bệnh án thành công!')
      }

      setTimeout(() => {
        router.push('/doctor/medical-records')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {existingRecord ? 'Cập nhật Bệnh án' : 'Tạo Bệnh án Mới'}
          </h1>
          <p className="text-gray-600">Nhập thông tin khám bệnh và kết quả xét nghiệm</p>
        </div>

        {/* Patient Info Card */}
        {appointment && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Thông tin bệnh nhân</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Họ tên:</span>
                <span className="ml-2 text-blue-900">{appointment.patient.name}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Mã BN:</span>
                <span className="ml-2 text-blue-900">{appointment.patient.patientId.toString().padStart(6, '0')}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Ngày sinh:</span>
                <span className="ml-2 text-blue-900">
                  {appointment.patient.dob ? new Date(appointment.patient.dob).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Giới tính:</span>
                <span className="ml-2 text-blue-900">{appointment.patient.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Điện thoại:</span>
                <span className="ml-2 text-blue-900">{appointment.patient.phone}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Thời gian khám:</span>
                <span className="ml-2 text-blue-900">
                  {appointment.time} - {new Date(appointment.date).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Medical Record Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Medical Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khám bệnh</h3>
            
            {/* Symptoms */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Triệu chứng <span className="text-red-500">*</span>
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập các triệu chứng của bệnh nhân..."
                required
              />
            </div>

            {/* Diagnosis */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chẩn đoán <span className="text-red-500">*</span>
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập chẩn đoán bệnh..."
                required
              />
            </div>

            {/* Treatment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Điều trị / Đơn thuốc
              </label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập phương pháp điều trị, đơn thuốc..."
              />
            </div>
          </div>

          {/* Lab Results */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Kết quả xét nghiệm</h3>
              <button
                type="button"
                onClick={addLabResult}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm kết quả
              </button>
            </div>

            <div className="space-y-4">
              {labResults.map((lab, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Kết quả #{index + 1}</h4>
                    {labResults.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLabResult(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chi tiết kết quả
                      </label>
                      <textarea
                        value={lab.resultDetails}
                        onChange={(e) => handleLabResultChange(index, 'resultDetails', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập kết quả xét nghiệm..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày xét nghiệm
                      </label>
                      <input
                        type="date"
                        value={lab.resultDate}
                        onChange={(e) => handleLabResultChange(index, 'resultDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang lưu...' : (existingRecord ? 'Cập nhật bệnh án' : 'Tạo bệnh án')}
            </button>
          </div>
        </form>
      </div>
    </DoctorLayout>
  )
}
