'use client'

import { useEffect, useState } from 'react'

interface AppointmentHistory {
  historyId: number
  oldDate: string
  oldTime: string
  oldDoctorName: string | null
  newDate: string
  newTime: string
  newDoctorName: string | null
  changedBy: string
  changeReason: string | null
  changedDate: string
}

interface Props {
  appointmentId: number
  onClose: () => void
}

export default function AppointmentHistoryModal({ appointmentId, onClose }: Props) {
  const [histories, setHistories] = useState<AppointmentHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [appointmentId])

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5129/api/appointments/${appointmentId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setHistories(data)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (date: string, time: string) => {
    return `${new Date(date).toLocaleDateString('vi-VN')} lúc ${time}`
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'Patient': 'Bệnh nhân',
      'Doctor': 'Bác sĩ',
      'Admin': 'Quản trị viên'
    }
    return labels[role] || role
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Lịch Sử Thay Đổi</h2>
            <p className="text-sm text-gray-600 mt-1">Appointment ID: #{appointmentId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải lịch sử...</p>
            </div>
          ) : histories.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg">Chưa có lịch sử thay đổi</p>
              <p className="text-gray-500 text-sm mt-2">Lịch hẹn này chưa từng được đổi</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Timeline */}
              <div className="relative">
                {histories.map((history, index) => (
                  <div key={history.historyId} className="relative pb-8">
                    {/* Timeline line */}
                    {index !== histories.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-300"></div>
                    )}
                    
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{histories.length - index}</span>
                    </div>

                    {/* Content */}
                    <div className="ml-12">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {/* Metadata */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                              {getRoleLabel(history.changedBy)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(history.changedDate).toLocaleString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        {/* Changes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Old Info */}
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-bold text-red-900">Lịch cũ</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-700">
                                <span className="font-medium">Thời gian:</span> {formatDateTime(history.oldDate, history.oldTime)}
                              </p>
                              {history.oldDoctorName && (
                                <p className="text-gray-700">
                                  <span className="font-medium">Bác sĩ:</span> BS. {history.oldDoctorName}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </div>

                          {/* New Info */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm font-bold text-green-900">Lịch mới</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-700">
                                <span className="font-medium">Thời gian:</span> {formatDateTime(history.newDate, history.newTime)}
                              </p>
                              {history.newDoctorName && (
                                <p className="text-gray-700">
                                  <span className="font-medium">Bác sĩ:</span> BS. {history.newDoctorName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reason */}
                        {history.changeReason && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm">
                              <span className="font-medium text-yellow-900">Lý do:</span>
                              <span className="text-gray-700 ml-2">{history.changeReason}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
