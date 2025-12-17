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
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    payment: Payment | null
    transactionId: string
  }>({
    isOpen: false,
    payment: null,
    transactionId: ''
  })

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

  const handleConfirmPayment = async () => {
    if (!confirmModal.payment) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_URL}/payment/confirm/${confirmModal.payment.paymentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            transactionId: confirmModal.transactionId || undefined
          })
        }
      )

      if (response.ok) {
        alert('Xác nhận thanh toán thành công!')
        setConfirmModal({ isOpen: false, payment: null, transactionId: '' })
        fetchPayments()
      } else {
        alert('Lỗi xác nhận thanh toán')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Lỗi xác nhận thanh toán')
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
                      {payment.status === 'Pending' ? (
                        <button
                          onClick={() =>
                            setConfirmModal({
                              isOpen: true,
                              payment,
                              transactionId: ''
                            })
                          }
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                        >
                          Xác nhận
                        </button>
                      ) : (
                        <span className="text-gray-400">
                          {payment.transactionId || 'Đã xác nhận'}
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

        {/* Confirm Modal */}
        {confirmModal.isOpen && confirmModal.payment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Xác nhận thanh toán</h3>
              
              <div className="mb-4 space-y-2 bg-gray-50 p-4 rounded">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-semibold">#{confirmModal.payment.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-green-600">
                    {confirmModal.payment.totalAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nội dung CK:</span>
                  <span className="font-mono text-blue-600">
                    {confirmModal.payment.transferContent}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giao dịch MB Bank (tùy chọn)
                </label>
                <input
                  type="text"
                  value={confirmModal.transactionId}
                  onChange={(e) =>
                    setConfirmModal({ ...confirmModal, transactionId: e.target.value })
                  }
                  placeholder="FT25350123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nhập mã giao dịch từ app MB Bank để đối soát sau này
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setConfirmModal({ isOpen: false, payment: null, transactionId: '' })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Xác nhận thanh toán
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
                <strong>Lưu ý:</strong> Hãy kiểm tra kỹ trong app MB Bank trước khi xác nhận!
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
