'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import { useAuth } from '@/contexts/AuthContext'

interface MedicalRecord {
  recordId: number
  symptoms: string
  diagnosis: string
  treatment: string
  createdDate: string
  appointmentId: number
  appointment?: {
    appointmentId: number
    date: string
    time: string
    status: string
    patientId: number
    patient?: {
      patientId: number
      name: string
      dob: string
      gender: string
      phone: string
    }
  }
  labResults?: Array<{
    resultId: number
    resultDetails: string
    resultDate: string
  }>
}

export default function DoctorMedicalRecordsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientId = searchParams?.get('patientId')
  const { user, loading } = useAuth()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    if (user?.role !== 'Doctor') {
      router.push('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchMedicalRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [searchTerm, patientId, records])

  const fetchMedicalRecords = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'
      const response = await fetch(`${API_URL}/medical/records`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRecords(data)
      }
    } catch (error) {
      console.error('Error fetching medical records:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = records

    // Filter by patient ID from query params
    if (patientId) {
      filtered = filtered.filter((r) => r.appointment?.patientId === parseInt(patientId))
    }

    // Filter by search term (patient name or diagnosis)
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.appointment?.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRecords(filtered)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return 'N/A'
    return timeString.substring(0, 5)
  }

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setShowModal(true)
  }

  const handleDeleteRecord = async (recordId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bệnh án này?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5164/api/medical/records/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert('Xóa bệnh án thành công')
        fetchMedicalRecords()
      } else {
        alert('Không thể xóa bệnh án')
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('Đã xảy ra lỗi khi xóa bệnh án')
    }
  }

  if (loading || !user || isLoading) {
    return (
      <DoctorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Hồ Sơ Bệnh Án</h1>
            <p className="text-gray-600">Quản lý bệnh án điện tử của bệnh nhân</p>
          </div>
          {patientId && (
            <button
              onClick={() => router.push('/doctor/patients')}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Quay lại danh sách bệnh nhân
            </button>
          )}
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                placeholder="Tìm theo tên bệnh nhân hoặc chẩn đoán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị <span className="font-semibold">{filteredRecords.length}</span> / {records.length} bệnh án
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Medical Records List */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Không tìm thấy bệnh án</h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'Thử điều chỉnh bộ lọc để xem thêm kết quả'
                : 'Chưa có bệnh án nào trong hệ thống'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh nhân
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày khám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Triệu chứng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chẩn đoán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xét nghiệm
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.recordId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">
                            {record.appointment?.patient?.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {record.appointment?.patient?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.appointment?.patient?.phone || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(record.appointment?.date || '')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(record.appointment?.time || '')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {record.symptoms || 'Không có'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {record.diagnosis || 'Chưa có chẩn đoán'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        record.labResults && record.labResults.length > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {record.labResults && record.labResults.length > 0
                          ? `${record.labResults.length} kết quả`
                          : 'Chưa có'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewRecord(record)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => router.push(`/doctor/record/${record.appointmentId}`)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.recordId)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Chi Tiết Bệnh Án</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Thông tin bệnh nhân</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Họ tên:</span>
                    <span className="ml-2 font-medium">{selectedRecord.appointment?.patient?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày sinh:</span>
                    <span className="ml-2 font-medium">{formatDate(selectedRecord.appointment?.patient?.dob || '')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Giới tính:</span>
                    <span className="ml-2 font-medium">{selectedRecord.appointment?.patient?.gender}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Điện thoại:</span>
                    <span className="ml-2 font-medium">{selectedRecord.appointment?.patient?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Thông tin khám</h3>
                <div className="text-sm text-gray-700">
                  <p>Ngày khám: {formatDate(selectedRecord.appointment?.date || '')} lúc {formatTime(selectedRecord.appointment?.time || '')}</p>
                  <p>Ngày tạo bệnh án: {formatDate(selectedRecord.createdDate)}</p>
                </div>
              </div>

              {/* Medical Info */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Triệu chứng</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRecord.symptoms || 'Không có'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Chẩn đoán</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRecord.diagnosis || 'Chưa có chẩn đoán'}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Điều trị</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRecord.treatment || 'Chưa có phương pháp điều trị'}</p>
              </div>

              {/* Lab Results */}
              {selectedRecord.labResults && selectedRecord.labResults.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Kết quả xét nghiệm</h3>
                  <div className="space-y-3">
                    {selectedRecord.labResults.map((lab) => (
                      <div key={lab.resultId} className="bg-gray-50 rounded p-3">
                        <div className="text-sm">
                          <span className="text-gray-600">Ngày: </span>
                          <span className="font-medium">{formatDate(lab.resultDate)}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{lab.resultDetails}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowModal(false)
                  router.push(`/doctor/record/${selectedRecord.appointmentId}`)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  )
}
