'use client'

import React from 'react'
import AdminLayout from '@/components/AdminLayout'

const ReportsPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-600 mt-1">Xem các báo cáo và thống kê chi tiết</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Báo cáo doanh thu</h2>
            <p className="text-gray-500">Đang phát triển...</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Báo cáo khám bệnh</h2>
            <p className="text-gray-500">Đang phát triển...</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Báo cáo bệnh nhân</h2>
            <p className="text-gray-500">Đang phát triển...</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Báo cáo hiệu suất</h2>
            <p className="text-gray-500">Đang phát triển...</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default ReportsPage
