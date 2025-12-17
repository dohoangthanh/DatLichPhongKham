'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface Specialty {
  specialtyId: number
  name: string
}

interface Doctor {
  doctorId: number
  name: string
  phone: string
  specialty: Specialty | null
}

interface WorkShift {
  shiftId: number
  doctorId: number
  date: string
  startTime: string
  endTime: string
}

const SchedulesPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [allWorkShifts, setAllWorkShifts] = useState<WorkShift[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingShift, setEditingShift] = useState<WorkShift | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 10

  const [formData, setFormData] = useState({
    doctorId: 0,
    date: '',
    startTime: '08:00',
    endTime: '12:00'
  })

  useEffect(() => {
    fetchDoctors()
    fetchAllWorkShifts()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedDoctor, selectedSpecialty, selectedDate])

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/doctors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
        // Don't auto-select first doctor - show all by default
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllWorkShifts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/schedule/workshift`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAllWorkShifts(data)
      }
    } catch (error) {
      console.error('Error fetching work shifts:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingShift 
        ? `${API_URL}/schedule/workshift/${editingShift.shiftId}`
        : `${API_URL}/schedule/workshift`
      
      const response = await fetch(url, {
        method: editingShift ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowModal(false)
        setEditingShift(null)
        setFormData({ doctorId: 0, date: '', startTime: '08:00', endTime: '12:00' })
        await fetchAllWorkShifts()
        alert(editingShift ? 'Cập nhật ca làm việc thành công!' : 'Thêm ca làm việc thành công!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Server error:', response.status, errorData)
        alert(`Có lỗi xảy ra! ${errorData.message || ''}`)
      }
    } catch (error: any) {
      console.error('Error saving work shift:', error)
      alert(`Có lỗi xảy ra! ${error.message || ''}`)
    }
  }

  const handleEdit = (shift: WorkShift) => {
    setEditingShift(shift)
    setFormData({
      doctorId: shift.doctorId,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime
    })
    setShowModal(true)
  }

  const handleDelete = async (shiftId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/schedule/workshift/${shiftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchAllWorkShifts()
        alert('Xóa ca làm việc thành công!')
      } else {
        alert('Ca làm việc quá hạn hoặc có lịch hẹn!')
      }
    } catch (error) {
      console.error('Error deleting work shift:', error)
      alert('Ca làm việc quá hạn hoặc có lịch hẹn!')
    }
  }

  // Get unique specialties from doctors
  const specialties = Array.from(new Set(
    doctors
      .filter(d => d.specialty !== null)
      .map(d => d.specialty!.name)
  )).sort()

  // Filter workShifts based on selected filters
  const workShifts = allWorkShifts.filter(shift => {
    if (selectedDoctor && shift.doctorId !== selectedDoctor) return false
    if (selectedDate && shift.date !== selectedDate) return false
    if (selectedSpecialty) {
      const doctor = doctors.find(d => d.doctorId === shift.doctorId)
      if (!doctor?.specialty || doctor.specialty.name !== selectedSpecialty) return false
    }
    return true
  })

  const totalPages = Math.ceil(workShifts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentShifts = workShifts.slice(startIndex, endIndex)

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Lịch làm việc Bác sĩ</h1>
          <button
            onClick={() => {
              setEditingShift(null)
              setFormData({ doctorId: 0, date: '', startTime: '08:00', endTime: '12:00' })
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            <span>Thêm Ca làm việc</span>
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bác sĩ
              </label>
              <select
                value={selectedDoctor || ''}
                onChange={(e) => setSelectedDoctor(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả bác sĩ</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctorId} value={doctor.doctorId}>
                    {doctor.name} - {doctor.specialty?.name || 'Chưa có chuyên khoa'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chuyên khoa
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả chuyên khoa</option>
                {specialties.map((specialty, index) => (
                  <option key={index} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setSelectedDoctor(null)
                setSelectedSpecialty('')
                setSelectedDate('')
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Xóa lọc
            </button>
            <div className="text-sm text-gray-600 flex items-center">
              Hiển thị {workShifts.length} ca làm việc
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên Bác Sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chuyên Khoa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày Làm Việc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giờ Bắt Đầu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giờ Kết Thúc
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentShifts.map((shift) => {
                const doctor = doctors.find(d => d.doctorId === shift.doctorId)
                return (
                  <tr key={shift.shiftId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doctor?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doctor?.specialty?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(shift.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shift.startTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shift.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(shift)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(shift.shiftId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1}-{Math.min(endIndex, workShifts.length)} of {workShifts.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingShift ? 'Chỉnh sửa Ca làm việc' : 'Thêm Ca làm việc'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bác sĩ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>-- Chọn bác sĩ --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.doctorId} value={doctor.doctorId}>
                      {doctor.name} - {doctor.specialty?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày làm việc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setFormData({ doctorId: 0, date: '', startTime: '08:00', endTime: '12:00' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default SchedulesPage
