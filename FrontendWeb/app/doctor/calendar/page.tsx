'use client'

import React, { useState, useEffect } from 'react'
import DoctorLayout from '@/components/DoctorLayout'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface WorkShift {
  shiftId: number
  doctorId: number
  date: string
  startTime: string
  endTime: string
}

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

interface DaySchedule {
  date: string
  dayName: string
  shifts: WorkShift[]
  appointments: Appointment[]
  isToday: boolean
}

export default function DoctorCalendarPage() {
  const { user, token } = useAuth()
  const [schedules, setSchedules] = useState<DaySchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [formData, setFormData] = useState({
    date: '',
    startTime: '08:00',
    endTime: '17:00'
  })

  useEffect(() => {
    if (user?.doctorId && token) {
      loadSchedules()
    }
  }, [user, token])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      
      // Get next 7 days
      const days: DaySchedule[] = []
      const today = new Date()
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        
        days.push({
          date: dateStr,
          dayName: getDayName(date),
          shifts: [],
          appointments: [],
          isToday: i === 0
        })
      }

      // Fetch shifts
      const shiftsResponse = await fetch(`${API_URL}/schedule/workshift/${user?.doctorId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (shiftsResponse.ok) {
        const shifts = await shiftsResponse.json()
        shifts.forEach((shift: WorkShift) => {
          const day = days.find(d => d.date === shift.date)
          if (day) day.shifts.push(shift)
        })
      }

      // Fetch appointments
      const apptResponse = await fetch(`${API_URL}/medical/appointments?period=week`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (apptResponse.ok) {
        const appointments = await apptResponse.json()
        appointments.forEach((appt: Appointment) => {
          const day = days.find(d => d.date === appt.date)
          if (day) day.appointments.push(appt)
        })
      }

      setSchedules(days)
    } catch (error) {
      console.error('Error loading schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDayName = (date: Date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
    return days[date.getDay()]
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getDate()}/${date.getMonth() + 1}`
  }

  const handleOpenModal = (date: string) => {
    setSelectedDate(date)
    setFormData({ ...formData, date })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      const response = await fetch(`${API_URL}/schedule/workshift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: user?.doctorId,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime
        })
      })

      if (response.ok) {
        alert('✅ Đăng ký ca làm việc thành công!')
        setShowModal(false)
        setFormData({ date: '', startTime: '08:00', endTime: '17:00' })
        loadSchedules()
      } else {
        const error = await response.json()
        alert('❌ ' + (error.message || 'Có lỗi xảy ra khi đăng ký ca làm việc'))
      }
    } catch (error) {
      console.error('Error creating shift:', error)
      alert('❌ Có lỗi xảy ra!')
    }
  }

  const handleDeleteShift = async (shiftId: number) => {
    if (!confirm('Bạn có chắc muốn xóa ca làm việc này?')) return

    try {
      const response = await fetch(`${API_URL}/schedule/workshift/${shiftId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('✅ Xóa ca làm việc thành công!')
        loadSchedules()
      } else {
        alert('❌ Không thể xóa ca làm việc')
      }
    } catch (error) {
      console.error('Error deleting shift:', error)
      alert('❌ Có lỗi xảy ra!')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      'Pending': { label: 'Chờ khám', className: 'bg-yellow-100 text-yellow-800' },
      'Scheduled': { label: 'Đã lên lịch', className: 'bg-blue-100 text-blue-800' },
      'Completed': { label: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
      'Cancelled': { label: 'Đã hủy', className: 'bg-red-100 text-red-800' }
    }

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải lịch khám...</p>
          </div>
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">📅 Lịch khám của tôi</h1>
          <p className="text-gray-600">Xem và đăng ký ca làm việc cho 7 ngày tới</p>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 gap-4">
          {schedules.map((day) => (
            <div
              key={day.date}
              className={`bg-white rounded-lg shadow-sm border ${
                day.isToday ? 'border-blue-500 border-2' : ''
              } p-4`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`text-center ${day.isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                    <div className="text-2xl font-bold">{formatDate(day.date)}</div>
                    <div className="text-sm">{day.dayName}</div>
                  </div>
                  {day.isToday && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      Hôm nay
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleOpenModal(day.date)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  ➕ Đăng ký ca
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Work Shifts */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">🕐 Ca làm việc</h3>
                  {day.shifts.length > 0 ? (
                    <div className="space-y-2">
                      {day.shifts.map((shift) => (
                        <div
                          key={shift.shiftId}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded"
                        >
                          <div>
                            <p className="font-medium text-green-800">
                              {shift.startTime} - {shift.endTime}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteShift(shift.shiftId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic py-2">Chưa có ca làm việc</p>
                  )}
                </div>

                {/* Appointments */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">👥 Lịch hẹn</h3>
                  {day.appointments.length > 0 ? (
                    <div className="space-y-2">
                      {day.appointments.map((appt) => (
                        <div
                          key={appt.appointmentId}
                          className="p-3 bg-blue-50 border border-blue-200 rounded"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-blue-900">{appt.time}</p>
                            {getStatusBadge(appt.status)}
                          </div>
                          <p className="text-sm text-gray-700">{appt.patient.name}</p>
                          <p className="text-xs text-gray-500">{appt.patient.phone}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic py-2">Chưa có lịch hẹn</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal đăng ký ca làm việc */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">📝 Đăng ký ca làm việc</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✖️
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ bắt đầu
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ kết thúc
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Đăng ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
