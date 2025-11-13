'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface PaymentInfo {
  appointmentId: number
  date: string
  time: string
  doctor: {
    name: string
  }
  specialty: {
    name: string
  }
  payment: {
    paymentId: number
    totalAmount: number
    paymentMethod: string
    status: string
  }
}

export default function PaymentPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.appointmentId as string
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('VNPAY')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Patient')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (token && user?.role === 'Patient' && appointmentId) {
      fetchPaymentInfo()
    }
  }, [token, user, appointmentId])

  const fetchPaymentInfo = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/booking/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPaymentInfo(data)
      } else {
        alert('Không tìm thấy thông tin lịch khám')
        router.push('/patient/history')
      }
    } catch (error) {
      console.error('Error fetching payment info:', error)
      alert('Có lỗi xảy ra khi tải thông tin thanh toán')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentInfo?.payment?.paymentId) {
      alert('Không tìm thấy thông tin thanh toán')
      return
    }

    try {
      setIsProcessing(true)
      const response = await fetch(`${API_URL}/payment/confirm/${paymentInfo.payment.paymentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        alert('Thanh toán thành công!')
        router.push('/patient/history')
      } else {
        const error = await response.json()
        alert(error.message || 'Thanh toán thất bại')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Có lỗi xảy ra khi thanh toán')
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'Patient' || !paymentInfo) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Xác nhận và Thanh toán
            </h1>
            <p className="text-gray-600">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
          </div>

          {/* Appointment Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              Thông tin Lịch hẹn
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Bác sĩ & Chuyên khoa:</span>
                <span className="font-semibold text-gray-800 text-right">
                  BS. {paymentInfo.doctor.name}<br/>
                  <span className="text-sm text-gray-600">Khoa {paymentInfo.specialty.name}</span>
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày & Giờ hẹn:</span>
                <span className="font-semibold text-gray-800 text-right">
                  {paymentInfo.time} - Thứ Ba, {formatDate(paymentInfo.date)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Bệnh nhân & Mã lịch hẹn:</span>
                <span className="font-semibold text-gray-800 text-right">
                  {user.username}<br/>
                  <span className="text-sm text-gray-600">#{appointmentId.padStart(10, '0')}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Payment Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              Tóm tắt Chi phí
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Phí khám ban đầu</span>
                <span className="text-gray-800">{formatCurrency(paymentInfo.payment.totalAmount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Xét nghiệm máu tổng quát</span>
                <span className="text-gray-800">{formatCurrency(0)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Phí dịch vụ</span>
                <span className="text-gray-800">{formatCurrency(0)}</span>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Tổng cộng</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(paymentInfo.payment.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
              Chọn Phương thức Thanh toán
            </h2>
            
            <div className="space-y-3">
              {/* VNPAY Option */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === 'VNPAY' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="VNPAY"
                  checked={selectedMethod === 'VNPAY'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="ml-4 flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">VNPAY</span>
                  </div>
                  <span className="font-semibold text-gray-800">Thanh toán qua VNPAY</span>
                </div>
              </label>

              {/* Momo Option */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === 'Momo' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Momo"
                  checked={selectedMethod === 'Momo'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="ml-4 flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-pink-600 rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">Momo</span>
                  </div>
                  <span className="font-semibold text-gray-800">Thanh toán qua Momo</span>
                </div>
              </label>

              {/* Cash Option */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === 'Cash' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash"
                  checked={selectedMethod === 'Cash'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-blue-600"
                />
                <div className="ml-4 flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-800">Thẻ Tín dụng/Ghi nợ</span>
                </div>
              </label>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-semibold">Thanh toán của bạn được bảo mật</p>
              <p className="text-sm text-blue-700 mt-1">
                Đây là môi trường giả lập thanh toán. Nhấn nút để xác nhận thanh toán thành công.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing || paymentInfo.payment.status === 'Paid'}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang xử lý...
                </span>
              ) : paymentInfo.payment.status === 'Paid' ? (
                'Đã thanh toán'
              ) : (
                'Xác nhận Thanh toán'
              )}
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
