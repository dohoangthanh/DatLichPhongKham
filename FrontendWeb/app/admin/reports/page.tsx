'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { statsApi } from '@/services/adminApi'

interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  completedAppointments: number
  pendingAppointments: number
  cancelledAppointments: number
  totalRevenue: number
  monthlyRevenue: number
}

interface RevenueStats {
  totalRevenue: number
  totalPayments: number
  dailyRevenue: Array<{
    date: string
    revenue: number
    paymentCount: number
  }>
  monthlyRevenue: Array<{
    year: number
    month: number
    revenue: number
    paymentCount: number
  }>
}

interface TopPatient {
  patientId: number
  patientName: string
  phone: string
  appointmentCount: number
  totalSpent: number
  lastVisit: string
}

interface AppointmentByStatus {
  status: string
  count: number
  percentage: number
}

interface AppointmentBySpecialty {
  specialtyName: string
  appointmentCount: number
  revenue: number
}

const ReportsPage: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null)
  const [topPatients, setTopPatients] = useState<TopPatient[]>([])
  const [appointmentsByStatus, setAppointmentsByStatus] = useState<AppointmentByStatus[]>([])
  const [appointmentsBySpecialty, setAppointmentsBySpecialty] = useState<AppointmentBySpecialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('monthly')
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadAllStats()
  }, [dateRange])

  const loadAllStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [dashboard, revenue, patients, byStatus, bySpecialty] = await Promise.all([
        statsApi.getDashboard().catch(err => {
          console.error('Dashboard error:', err)
          return null
        }),
        statsApi.getRevenue(dateRange.from, dateRange.to).catch(err => {
          console.error('Revenue error:', err)
          return null
        }),
        statsApi.getTopPatients(10, dateRange.from, dateRange.to).catch(err => {
          console.error('Top patients error:', err)
          return []
        }),
        statsApi.getAppointmentsByStatus(dateRange.from, dateRange.to).catch(err => {
          console.error('By status error:', err)
          return []
        }),
        statsApi.getAppointmentsBySpecialty(dateRange.from, dateRange.to).catch(err => {
          console.error('By specialty error:', err)
          return []
        })
      ])
      
      setDashboardStats(dashboard)
      setRevenueStats(revenue)
      setTopPatients(patients || [])
      setAppointmentsByStatus(byStatus || [])
      setAppointmentsBySpecialty(bySpecialty || [])
    } catch (error) {
      console.error('Error loading stats:', error)
      setError('Có lỗi khi tải thống kê')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    })
  }

  const formatMonth = (year: number, month: number) => {
    return `T${month}/${year}`
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Completed': 'bg-green-500',
      'Pending': 'bg-yellow-500',
      'Scheduled': 'bg-blue-500',
      'Cancelled': 'bg-red-500',
      'Confirmed': 'bg-cyan-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'Completed': 'Hoàn thành',
      'Pending': 'Chờ xác nhận',
      'Scheduled': 'Đã đặt lịch',
      'Cancelled': 'Đã hủy',
      'Confirmed': 'Đã xác nhận'
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const revenueData = viewMode === 'monthly' 
    ? revenueStats?.monthlyRevenue || []
    : revenueStats?.dailyRevenue || []

  const maxRevenue = viewMode === 'monthly'
    ? Math.max(...(revenueStats?.monthlyRevenue.map(m => m.revenue) || [1]))
    : Math.max(...(revenueStats?.dailyRevenue.map(d => d.revenue) || [1]))

  const maxSpecialtyCount = Math.max(...(appointmentsBySpecialty.map(s => s.appointmentCount) || [1]))
  const maxPatientCount = Math.max(...(topPatients.map(p => p.appointmentCount) || [1]))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thống kê & Báo cáo</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động phòng khám</p>
        </div>

        {/* Unified Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Lọc dữ liệu:</span>
              
              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-gray-100 p-0.5 rounded">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                    viewMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Ngày
                </button>
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                    viewMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tháng
                </button>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-400">→</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={loadAllStats}
                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium shadow-sm"
              >
                Tải lại
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Overview Stats Cards - Compact */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-600 uppercase">Bệnh nhân</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats?.totalPatients || 0}</p>
          </div>

          <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-600 uppercase">Bác sĩ</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats?.totalDoctors || 0}</p>
          </div>

          <div className="bg-white border-l-4 border-purple-500 rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-600 uppercase">Lịch hẹn</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardStats?.totalAppointments || 0}</p>
            <p className="text-xs text-gray-500 mt-1">{dashboardStats?.completedAppointments || 0} hoàn thành</p>
          </div>

          <div className="bg-white border-l-4 border-orange-500 rounded-lg shadow-sm p-4">
            <p className="text-xs text-gray-600 uppercase">Doanh thu tháng</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(dashboardStats?.monthlyRevenue || 0)}</p>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Revenue Chart - Enhanced */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">📊 Doanh thu</h2>

            {revenueData.length > 0 ? (
              <div className="relative">
                {/* Chart with professional styling */}
                <div className="relative h-72 bg-gradient-to-b from-gray-50 to-white rounded-lg p-4">
                  <div className="h-full flex items-end justify-around gap-3 border-b-2 border-l-2 border-gray-400">
                    {viewMode === 'monthly' 
                      ? revenueStats?.monthlyRevenue.slice(-8).map((item, index) => {
                          const height = (item.revenue / maxRevenue) * 100
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center group relative" style={{ maxWidth: '80px' }}>
                              {/* Value label on top */}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap font-semibold">
                                  {formatCurrency(item.revenue)}
                                </div>
                              </div>
                              
                              <div className="w-full flex items-end justify-center h-full relative">
                                <div
                                  className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 hover:from-blue-700 hover:via-blue-600 hover:to-blue-500 rounded-t-lg shadow-lg transition-all duration-300 cursor-pointer relative"
                                  style={{ height: `${Math.max(height, 5)}%` }}
                                >
                                  {/* Value on bar */}
                                  {height > 15 && (
                                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-sm font-bold text-gray-800 whitespace-nowrap">
                                      {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(item.revenue)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-700 mt-3 font-semibold">{item.month}/{item.year}</p>
                            </div>
                          )
                        })
                      : revenueStats?.dailyRevenue.slice(-10).map((item, index) => {
                          const height = (item.revenue / maxRevenue) * 100
                          const date = new Date(item.date)
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center group relative" style={{ maxWidth: '65px' }}>
                              {/* Tooltip */}
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap font-semibold">
                                  {formatCurrency(item.revenue)}
                                </div>
                              </div>
                              
                              <div className="w-full flex items-end justify-center h-full">
                                <div
                                  className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-500 rounded-t-lg shadow-lg transition-all duration-300 cursor-pointer"
                                  style={{ height: `${Math.max(height, 5)}%` }}
                                >
                                  {/* Value on bar */}
                                  {height > 15 && (
                                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-sm font-bold text-gray-800 whitespace-nowrap">
                                      {new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(item.revenue)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-gray-700 mt-3 font-semibold">{date.getDate()}/{date.getMonth() + 1}</p>
                            </div>
                          )
                        })
                    }
                  </div>
                </div>
                
                {/* Total Summary */}
                <div className="mt-4 text-center bg-gradient-to-r from-blue-50 via-emerald-50 to-blue-50 rounded-lg py-3 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    Tổng doanh thu: <span className="font-bold text-xl text-gray-900 ml-1">{formatCurrency(revenueStats?.totalRevenue || 0)}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-medium">Không có dữ liệu</p>
              </div>
            )}
          </div>

          {/* Specialty Chart - Enhanced */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">🏥 Chuyên khoa</h2>
            
            {appointmentsBySpecialty.length > 0 ? (
              <div className="relative">
                {/* Chart with professional styling */}
                <div className="relative h-72 bg-gradient-to-b from-gray-50 to-white rounded-lg p-4">
                  <div className="h-full flex items-end justify-around gap-3 border-b-2 border-l-2 border-gray-400">
                    {appointmentsBySpecialty.slice(0, 6).map((item, index) => {
                      const height = (item.appointmentCount / maxSpecialtyCount) * 100
                      const gradients = [
                        'from-purple-600 via-purple-500 to-purple-400',
                        'from-pink-600 via-pink-500 to-pink-400',
                        'from-orange-600 via-orange-500 to-orange-400',
                        'from-cyan-600 via-cyan-500 to-cyan-400',
                        'from-indigo-600 via-indigo-500 to-indigo-400',
                        'from-teal-600 via-teal-500 to-teal-400'
                      ]
                      const hoverGradients = [
                        'hover:from-purple-700 hover:via-purple-600 hover:to-purple-500',
                        'hover:from-pink-700 hover:via-pink-600 hover:to-pink-500',
                        'hover:from-orange-700 hover:via-orange-600 hover:to-orange-500',
                        'hover:from-cyan-700 hover:via-cyan-600 hover:to-cyan-500',
                        'hover:from-indigo-700 hover:via-indigo-600 hover:to-indigo-500',
                        'hover:from-teal-700 hover:via-teal-600 hover:to-teal-500'
                      ]
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative" style={{ maxWidth: '90px' }}>
                          {/* Tooltip on hover */}
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap">
                              <div className="font-bold">{item.specialtyName}</div>
                              <div className="text-blue-300">{item.appointmentCount} lịch hẹn</div>
                              <div className="text-green-300">{formatCurrency(item.revenue)}</div>
                            </div>
                          </div>

                          <div className="w-full flex items-end justify-center h-full">
                            <div
                              className={`w-full bg-gradient-to-t ${gradients[index]} ${hoverGradients[index]} rounded-t-lg shadow-lg transition-all duration-300 cursor-pointer relative`}
                              style={{ height: `${Math.max(height, 5)}%` }}
                            >
                              {/* Count on top of bar */}
                              <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 text-base font-bold text-gray-900 bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-md border-2 border-gray-300">
                                {item.appointmentCount}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-700 mt-3 font-semibold text-center w-full leading-tight" title={item.specialtyName}>
                            {item.specialtyName.length > 12 ? item.specialtyName.substring(0, 12) + '...' : item.specialtyName}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                {/* Total Summary */}
                <div className="mt-4 text-center bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-lg py-3 border border-gray-200">
                  <p className="text-sm text-gray-600">
                    Tổng lịch hẹn: <span className="font-bold text-xl text-gray-900 ml-1">{appointmentsBySpecialty.reduce((sum, s) => sum + s.appointmentCount, 0)}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-medium">Không có dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Status Distribution - Compact */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái lịch hẹn</h2>
            <div className="space-y-3">
              {appointmentsByStatus.map((item, index) => {
                const maxCount = Math.max(...appointmentsByStatus.map(s => s.count))
                const width = (item.count / maxCount) * 100
                
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{getStatusLabel(item.status)}</span>
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(item.status)} rounded-full transition-all duration-500`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Patients - Compact */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top bệnh nhân</h2>
            <div className="space-y-2">
              {topPatients.slice(0, 5).map((patient, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-400 text-white' :
                    index === 1 ? 'bg-gray-300 text-white' :
                    index === 2 ? 'bg-orange-400 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{patient.patientName}</p>
                    <p className="text-xs text-gray-500">{patient.appointmentCount} lượt khám</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">{formatCurrency(patient.totalSpent)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default ReportsPage
