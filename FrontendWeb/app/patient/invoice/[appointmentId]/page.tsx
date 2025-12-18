'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { paymentApi } from '@/services/patientApi'

interface Invoice {
  invoiceId: string
  appointmentId: number
  date: string
  patientName: string
  patientUsername: string
  doctorName: string
  specialty: string
  appointmentDate: string
  appointmentTime: string
  appointmentDayOfWeek: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  paymentDate: string
  status: string
  loyaltyPointsEarned: number
  currentLoyaltyPoints: number
}

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading, token } = useAuth()
  const appointmentId = parseInt(params.appointmentId as string)
  
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'Patient')) {
      router.replace('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (token && appointmentId) {
      fetchInvoice()
    }
  }, [token, appointmentId])

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const data = await paymentApi.getInvoice(appointmentId)
      setInvoice(data)
    } catch (err: any) {
      setError(err.message || 'Không thể tải hóa đơn')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải hóa đơn...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-semibold mb-4">⚠️ {error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Quay lại
            </button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Action Buttons - Hide when printing */}
        <div className="mb-6 flex gap-4 no-print">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
          >
            ← Quay lại
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-md"
          >
            🖨️ In hóa đơn
          </button>
        </div>

        {/* Invoice */}
        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-blue-600">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">HÓA ĐƠN THANH TOÁN</h1>
            <p className="text-gray-600">Phòng Khám Đa Khoa</p>
            <p className="text-sm text-gray-500 mt-2">Mã hóa đơn: {invoice.invoiceId}</p>
          </div>

          {/* Invoice Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-bold text-gray-700 mb-3">Thông tin bệnh nhân</h3>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="text-gray-600 w-32">Họ tên:</span>
                  <span className="font-semibold">{invoice.patientName}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Tài khoản:</span>
                  <span className="font-semibold">{invoice.patientUsername}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-700 mb-3">Thông tin khám bệnh</h3>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="text-gray-600 w-32">Bác sĩ:</span>
                  <span className="font-semibold">{invoice.doctorName}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Chuyên khoa:</span>
                  <span className="font-semibold">{invoice.specialty}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Ngày khám:</span>
                  <span className="font-semibold">
                    {invoice.appointmentDayOfWeek}, {new Date(invoice.appointmentDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-32">Giờ khám:</span>
                  <span className="font-semibold">{invoice.appointmentTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-700 mb-4">Chi tiết dịch vụ</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 border-b-2">Dịch vụ</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 border-b-2">Số lượng</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 border-b-2">Đơn giá</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 border-b-2">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4 text-center">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">{item.price.toLocaleString('vi-VN')} ₫</td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {(item.quantity * item.price).toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-gray-300 pt-4 mb-8">
            <div className="flex justify-end mb-2">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">{invoice.subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Thuế (VAT):</span>
                  <span className="font-semibold">{invoice.tax.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-blue-600 border-t-2 pt-2">
                  <span>TỔNG CỘNG:</span>
                  <span>{invoice.total.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Phương thức thanh toán</p>
                <p className="font-semibold text-gray-800">{invoice.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Ngày thanh toán</p>
                <p className="font-semibold text-gray-800">
                  {invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleString('vi-VN') : 'Chưa thanh toán'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  invoice.status === 'Đã thanh toán' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Điểm tích lũy nhận được</p>
                <p className="font-semibold text-blue-600">+{invoice.loyaltyPointsEarned} điểm</p>
                <p className="text-xs text-gray-500 mt-1">Tổng điểm hiện có: {invoice.currentLoyaltyPoints}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-6 border-t">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ của Phòng Khám Đa Khoa</p>
            <p className="mt-2">Hotline: 1900-xxxx | Email: support@phongkham.vn</p>
            <p className="mt-2 text-xs">In lúc: {new Date().toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          header, footer {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </main>
  )
}
