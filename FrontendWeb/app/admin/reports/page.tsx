'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { statsApi } from '@/services/adminApi'

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

interface AppointmentBySpecialty {
  specialtyName: string
  appointmentCount: number
  revenue: number
}

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null)
  const [topPatients, setTopPatients] = useState<TopPatient[]>([])
  const [appointmentsBySpecialty, setAppointmentsBySpecialty] = useState<AppointmentBySpecialty[]>([])
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })
  const [reportType, setReportType] = useState<'revenue' | 'patients' | 'appointments' | 'performance'>('revenue')

  useEffect(() => {
    loadReports()
  }, [dateRange])

  const loadReports = async () => {
    try {
      setLoading(true)
      
      try {
        const revenue = await statsApi.getRevenue(dateRange.from, dateRange.to)
        console.log('Revenue data:', revenue)
        setRevenueStats(revenue)
      } catch (err) {
        console.error('Error loading revenue:', err)
      }

      try {
        const patients = await statsApi.getTopPatients(20, dateRange.from, dateRange.to)
        console.log('Top patients:', patients)
        setTopPatients(patients)
      } catch (err) {
        console.error('Error loading top patients:', err)
      }

      try {
        const bySpecialty = await statsApi.getAppointmentsBySpecialty(dateRange.from, dateRange.to)
        console.log('By specialty:', bySpecialty)
        setAppointmentsBySpecialty(bySpecialty)
      } catch (err) {
        console.error('Error loading by specialty:', err)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
      alert('Lỗi khi tải báo cáo: ' + (error as Error).message)
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

  const exportToCSV = () => {
    alert('Chức năng xuất báo cáo đang được phát triển')
  }

  const printReport = () => {
    window.print()
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
            <p className="text-gray-600 mt-1">Xem các báo cáo và thống kê chi tiết</p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={printReport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              In báo cáo
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại báo cáo</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="revenue">Báo cáo doanh thu</option>
                <option value="patients">Báo cáo bệnh nhân</option>
                <option value="appointments">Báo cáo lịch khám</option>
                <option value="performance">Báo cáo hiệu suất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Revenue Report */}
        {reportType === 'revenue' && revenueStats && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueStats.totalRevenue)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tổng giao dịch</p>
                    <p className="text-2xl font-bold text-gray-900">{revenueStats.totalPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Trung bình/giao dịch</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {revenueStats.totalPayments > 0 ? formatCurrency(revenueStats.totalRevenue / revenueStats.totalPayments) : '0₫'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Revenue Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Doanh thu theo tháng</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tháng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số giao dịch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trung bình</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {revenueStats.monthlyRevenue.map((month, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Tháng {month.month}/{month.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          {formatCurrency(month.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {month.paymentCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {month.paymentCount > 0 ? formatCurrency(month.revenue / month.paymentCount) : '0₫'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Patients Report */}
        {reportType === 'patients' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Bệnh nhân có lượt khám nhiều nhất</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số điện thoại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượt khám</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng chi tiêu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lần khám cuối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topPatients.map((patient, index) => (
                    <tr key={patient.patientId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {patient.patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {patient.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        {patient.appointmentCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        {formatCurrency(patient.totalSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(patient.lastVisit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments Report */}
        {reportType === 'appointments' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Thống kê lịch khám theo chuyên khoa</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chuyên khoa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượt khám</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trung bình/lượt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointmentsBySpecialty.map((specialty, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {specialty.specialtyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        {specialty.appointmentCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        {formatCurrency(specialty.revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {specialty.appointmentCount > 0 ? formatCurrency(specialty.revenue / specialty.appointmentCount) : '0₫'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance Report */}
        {reportType === 'performance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Hiệu suất chung</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Tổng số bệnh nhân</span>
                  <span className="font-semibold text-gray-900">{topPatients.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Tổng số lịch khám</span>
                  <span className="font-semibold text-gray-900">
                    {topPatients.reduce((sum, p) => sum + p.appointmentCount, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Tổng doanh thu</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(revenueStats?.totalRevenue || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Thống kê theo chuyên khoa</h2>
              <div className="space-y-3">
                {appointmentsBySpecialty.map((specialty, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-gray-600">{specialty.specialtyName}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-blue-600 font-semibold">{specialty.appointmentCount} lượt</span>
                      <span className="text-green-600 font-semibold">{formatCurrency(specialty.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default ReportsPage
