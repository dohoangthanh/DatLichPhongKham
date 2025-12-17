'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface Payment {
  paymentId: number
  appointmentId: number
  totalAmount: number
  status: string
  paymentMethod: string
  paymentDate: string | null
  transactionId: string | null
  transferContent: string | null
  patientName?: string
  doctorName?: string
  appointmentDate?: string
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('pending')

  useEffect(() => {
    fetchPayments()
  }, [filter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admin/payments?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý thanh toán</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded ${
                filter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Chờ xác nhận
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded ${
                filter === 'paid'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Đã thanh toán
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bệnh nhân
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bác sĩ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nội dung CK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.paymentId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{payment.paymentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.patientName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.doctorName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {payment.totalAmount.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                      {payment.transferContent || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.status === 'Paid' ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Chờ thanh toán
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.status === 'Paid' ? (
                        <span className="text-green-600 font-medium">
                          ✓ {payment.transactionId || 'Đã thanh toán'}
                        </span>
                      ) : (
                        <span className="text-yellow-600 font-medium">
                          ⏳ Đợi webhook từ Casso
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {payments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Không có thanh toán nào
              </div>
            )}
          </div>
        )}

        {/* Thông báo tự động xác nhận */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Thanh toán tự động qua Casso Webhook
              </h4>
              <p className="text-sm text-blue-800">
                Khi khách hàng chuyển khoản với nội dung đúng, hệ thống sẽ <strong>tự động xác nhận thanh toán</strong> trong vài giây. 
                Admin chỉ cần theo dõi, không cần xác nhận thủ công.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
