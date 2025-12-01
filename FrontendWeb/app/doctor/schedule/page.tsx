'use client'

import React, { useEffect, useState } from 'react'
import DoctorLayout from '@/components/DoctorLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface Patient {
  patientId: number
  name: string
  phone: string
}

interface Appointment {
  appointmentId: number
  date: string
  time: string
  status: string
  patient: Patient
}

export default function DoctorSchedulePage() {
  const { token } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('today')

  useEffect(() => {
    if (token) {
      fetchAppointments()
    }
  }, [token, period])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/medical/appointments?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Không thể tải danh sách lịch khám')
      }

      const data = await response.json()
      setAppointments(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      'Chờ khám': { label: 'Chờ khám', className: 'bg-yellow-100 text-yellow-800' },
      'Đã khám': { label: 'Đã khám', className: 'bg-green-100 text-green-800' },
      'Đã hủy': { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
      'Cancelled': { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
      'Vắng mặt': { label: 'Vắng mặt', className: 'bg-gray-100 text-gray-800' }
    }

    const statusInfo = statusMap[status] || { label: status, className: 'bg-blue-100 text-blue-800' }

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  const handleViewRecord = (appointmentId: number) => {
    router.push(`/doctor/record/${appointmentId}`)
  }

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lịch khám</h1>
          <p className="text-gray-600">Xem và quản lý các cuộc hẹn trong ngày và trong tuần.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Thời gian:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('today')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'today'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Hôm nay: {new Date().toLocaleDateString('vi-VN')}
              </button>
              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tuần này
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Appointments Table */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bệnh nhân
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chuyên khoa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Không có lịch khám nào
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appointment) => (
                      <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {appointment.time}
                            </div>
                            <div className="text-gray-500">
                              {new Date(appointment.date).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {appointment.patient.name}
                            </div>
                            <div className="text-gray-500">
                              {appointment.patient.patientId.toString().padStart(6, '0')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">Tìm mạch</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {appointment.status !== 'Đã hủy' && appointment.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleViewRecord(appointment.appointmentId)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Xem
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  )
}
