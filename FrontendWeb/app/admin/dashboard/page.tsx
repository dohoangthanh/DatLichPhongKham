'use client'

import React from 'react'
import AdminLayout from '@/components/AdminLayout'

const DashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600 mt-1">Xem tổng quan về hoạt động của phòng khám</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lịch hẹn hôm nay</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+12% so với hôm qua</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bệnh nhân</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+5% so với tháng trước</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bác sĩ</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">28</p>
              </div>
              <div className="text-4xl">👨‍⚕️</div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">8 chuyên khoa</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doanh thu tháng này</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">125M</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+8% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Lịch hẹn theo tuần</h2>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Biểu đồ sẽ được hiển thị ở đây
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h2>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Biểu đồ sẽ được hiển thị ở đây
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Hoạt động gần đây</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  👤
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Bệnh nhân mới đăng ký</p>
                  <p className="text-xs text-gray-500">Nguyễn Văn A - 5 phút trước</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  ✅
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Lịch hẹn hoàn thành</p>
                  <p className="text-xs text-gray-500">Trần Thị B - 10 phút trước</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  📋
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Kết quả xét nghiệm mới</p>
                  <p className="text-xs text-gray-500">Lê Văn C - 15 phút trước</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  💳
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Thanh toán thành công</p>
                  <p className="text-xs text-gray-500">Phạm Thị D - 20 phút trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default DashboardPage
