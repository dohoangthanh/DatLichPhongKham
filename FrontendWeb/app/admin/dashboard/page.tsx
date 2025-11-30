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

const DashboardPage: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null)
  const [topPatients, setTopPatients] = useState<TopPatient[]>([])
  const [appointmentsByStatus, setAppointmentsByStatus] = useState<AppointmentByStatus[]>([])
  const [appointmentsBySpecialty, setAppointmentsBySpecialty] = useState<AppointmentBySpecialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      
      // Load dashboard stats first
      try {
        const dashboard = await statsApi.getDashboard()
        console.log('Dashboard data:', dashboard)
        setDashboardStats(dashboard)
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setError('Không thể tải thống kê tổng quan')
      }

      // Load other stats
      try {
        const [revenue, patients, byStatus, bySpecialty] = await Promise.all([
          statsApi.getRevenue(dateRange.from, dateRange.to),
          statsApi.getTopPatients(10, dateRange.from, dateRange.to),
          statsApi.getAppointmentsByStatus(dateRange.from, dateRange.to),
          statsApi.getAppointmentsBySpecialty(dateRange.from, dateRange.to)
        ])
        
        console.log('Revenue data:', revenue)
        console.log('Top patients:', patients)
        console.log('By status:', byStatus)
        console.log('By specialty:', bySpecialty)
        
        setRevenueStats(revenue)
        setTopPatients(patients || [])
        setAppointmentsByStatus(byStatus || [])
        setAppointmentsBySpecialty(bySpecialty || [])
      } catch (err) {
        console.error('Error loading other stats:', err)
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        setError('Không thể tải một số thống kê: ' + errorMsg)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setError('Lỗi khi tải thống kê: ' + errorMsg)
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
    return new Date(dateString).toLocaleDateString('vi-VN')
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thống kê & Báo cáo</h1>
            <p className="text-gray-600 mt-1">Xem tổng quan về hoạt động của phòng khám</p>
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                ⚠️ {error}
              </div>
            )}
          </div>
          
          {/* Date Range Filter */}
          <div className="flex gap-4 items-center">
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <span className="flex items-center">đến</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => loadAllStats()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                🔄 Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng bệnh nhân</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats?.totalPatients || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                👥
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng bác sĩ</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats?.totalDoctors || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                👨‍⚕️
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng lịch hẹn</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats?.totalAppointments || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                📅
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600">Hoàn thành: {dashboardStats?.completedAppointments || 0}</p>
              <p className="text-xs text-gray-600">Đang chờ: {dashboardStats?.pendingAppointments || 0}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doanh thu tháng này</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(dashboardStats?.monthlyRevenue || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                💰
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-600">Tổng: {formatCurrency(dashboardStats?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>

        {/* Revenue Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê Doanh thu</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Tổng doanh thu (kỳ)</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(revenueStats?.totalRevenue || 0)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Số giao dịch</p>
              <p className="text-2xl font-bold text-green-600">{revenueStats?.totalPayments || 0}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Trung bình/giao dịch</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(revenueStats?.totalPayments ? (revenueStats.totalRevenue / revenueStats.totalPayments) : 0)}
              </p>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Doanh thu theo tháng</h3>
            <div className="overflow-x-auto">
              {revenueStats?.monthlyRevenue && revenueStats.monthlyRevenue.length > 0 ? (
              <div className="flex items-end gap-2 h-64 px-4">
                {revenueStats.monthlyRevenue.map((item, index) => {
                  const maxRevenue = Math.max(...(revenueStats.monthlyRevenue.map(m => m.revenue) || [0]))
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-blue-500 hover:bg-blue-600 transition-all rounded-t relative group" 
                           style={{ height: `${height}%`, minHeight: '20px' }}>
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {formatCurrency(item.revenue)}<br/>
                          {item.paymentCount} thanh toán
                        </div>
                      </div>
                      <p className="text-xs mt-2 text-gray-600">T{item.month}/{item.year}</p>
                    </div>
                  )
                })}  
              </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
                  <p className="text-gray-500">📊 Chưa có dữ liệu doanh thu trong khoảng thời gian này</p>
                </div>
              )}
            </div>
          </div>

          {/* Daily Revenue Table */}
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-3">Doanh thu theo ngày (10 ngày gần nhất)</h3>
            <div className="overflow-x-auto">
              {revenueStats?.dailyRevenue && revenueStats.dailyRevenue.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số giao dịch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {revenueStats.dailyRevenue.slice(-10).reverse().map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{formatDate(item.date)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.revenue)}</td>
                      <td className="px-4 py-3 text-sm text-right">{item.paymentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              ) : (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded">
                  <p className="text-gray-500">📅 Chưa có giao dịch nào trong khoảng thời gian này</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Patients and Appointment Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Patients */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Bệnh nhân thường xuyên</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bệnh nhân</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Số lần khám</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Chi tiêu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topPatients.length > 0 ? topPatients.map((patient, index) => (
                    <tr key={patient.patientId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{patient.patientName}</p>
                            <p className="text-xs text-gray-500">{patient.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {patient.appointmentCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {formatCurrency(patient.totalSpent)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        👥 Chưa có dữ liệu bệnh nhân trong khoảng thời gian này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Appointments by Status and Specialty */}
          <div className="space-y-6">
            {/* By Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lịch hẹn theo trạng thái</h2>
              {appointmentsByStatus.length > 0 ? (
              <div className="space-y-3">
                {appointmentsByStatus.map((item) => (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.status}</span>
                      <span className="text-gray-600">{item.count} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded">
                  <p className="text-gray-500">📊 Chưa có lịch hẹn trong khoảng thời gian này</p>
                </div>
              )}
            </div>

            {/* By Specialty */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Theo chuyên khoa</h2>
              {appointmentsBySpecialty.length > 0 ? (
              <div className="space-y-3">
                {appointmentsBySpecialty.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{item.specialtyName}</p>
                      <p className="text-xs text-gray-600">{item.appointmentCount} lượt khám</p>
                    </div>
                    <span className="text-blue-600 font-medium text-sm">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
              ) : (
                <div className="flex items-center justify-center py-8 bg-gray-50 rounded">
                  <p className="text-gray-500">🏥 Chưa có dữ liệu chuyên khoa trong khoảng thời gian này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default DashboardPage
