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
  const [promoCode, setPromoCode] = useState('')
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [promoMessage, setPromoMessage] = useState('')
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Patient')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (token && user?.role === 'Patient' && appointmentId) {
      fetchPaymentInfo()
      fetchLoyaltyPoints()
    }
  }, [token, user, appointmentId])

  const fetchLoyaltyPoints = async () => {
    try {
      const response = await fetch(`${API_URL}/loyaltypoints/my-points`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setLoyaltyPoints(data.points || 0)
      }
    } catch (error) {
      console.error('Error fetching loyalty points:', error)
    }
  }

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

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      setPromoMessage('Vui lòng nhập mã khuyến mãi')
      return
    }

    try {
      setIsValidatingPromo(true)
      setPromoMessage('')
      const response = await fetch(`${API_URL}/promotions/validate/${promoCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDiscountPercent(data.discountPercent || 0)
        setPromoMessage(`✓ Áp dụng thành công! Giảm ${data.discountPercent}%`)
      } else {
        const error = await response.json()
        setPromoMessage(`✗ ${error.message || 'Mã khuyến mãi không hợp lệ'}`)
        setDiscountPercent(0)
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoMessage('✗ Không thể xác thực mã khuyến mãi')
      setDiscountPercent(0)
    } finally {
      setIsValidatingPromo(false)
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
        const pointsEarned = Math.floor(getFinalAmount() / 10000)
        alert(`Thanh toán thành công! Bạn đã nhận được ${pointsEarned} điểm tích lũy.`)
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

  const getFinalAmount = () => {
    if (!paymentInfo) return 0
    const originalAmount = paymentInfo.payment.totalAmount
    const discount = originalAmount * (discountPercent / 100)
    return originalAmount - discount
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
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
      
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full mb-4 border-4 border-cyan-200">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Xác nhận và Thanh toán
            </h1>
            <p className="text-gray-600">Vui lòng kiểm tra thông tin trước khi thanh toán</p>
          </div>

          {/* Appointment Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-cyan-500">
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4 pb-2 border-b border-gray-200">
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

          {/* Loyalty Points Display */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-amber-900 font-semibold">Điểm tích lũy của bạn</p>
                  <p className="text-xs text-amber-700">Nhận 1 điểm cho mỗi 10,000 VNĐ thanh toán</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{loyaltyPoints}</p>
                <p className="text-xs text-amber-700">điểm</p>
              </div>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-purple-500">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 pb-2 border-b border-gray-200">
              Mã Khuyến mãi
            </h2>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Nhập mã khuyến mãi"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              <button
                onClick={handleValidatePromo}
                disabled={isValidatingPromo || !promoCode.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidatingPromo ? 'Đang kiểm tra...' : 'Áp dụng'}
              </button>
            </div>
            
            {promoMessage && (
              <p className={`mt-2 text-sm ${promoMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                {promoMessage}
              </p>
            )}
          </div>

          {/* Payment Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-emerald-500">
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4 pb-2 border-b border-gray-200">
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

              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="font-semibold">Giảm giá ({discountPercent}%)</span>
                  <span className="font-semibold">
                    - {formatCurrency(paymentInfo.payment.totalAmount * (discountPercent / 100))}
                  </span>
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Tổng cộng</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formatCurrency(getFinalAmount())}
                  </span>
                </div>
                {discountPercent > 0 && (
                  <p className="text-right text-sm text-green-600 mt-1">
                    Tiết kiệm {formatCurrency(paymentInfo.payment.totalAmount * (discountPercent / 100))}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-indigo-500">
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4 pb-2 border-b border-gray-200">
              Chọn Phương thức Thanh toán
            </h2>
            
            <div className="space-y-3">
              {/* VNPAY Option */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === 'VNPAY' ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20' : 'border-gray-200 hover:border-blue-300'
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
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xs">VNPAY</span>
                  </div>
                  <span className="font-semibold text-gray-800">Thanh toán qua VNPAY</span>
                </div>
              </label>

              {/* Momo Option */}
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMethod === 'Momo' ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-rose-50 shadow-lg shadow-pink-500/20' : 'border-gray-200 hover:border-pink-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Momo"
                  checked={selectedMethod === 'Momo'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-pink-600"
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
                selectedMethod === 'Cash' ? 'border-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 shadow-lg shadow-violet-500/20' : 'border-gray-200 hover:border-violet-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash"
                  checked={selectedMethod === 'Cash'}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-5 h-5 text-violet-600"
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
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <svg className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm text-emerald-900 font-semibold">Thanh toán của bạn được bảo mật</p>
              <p className="text-sm text-emerald-800 mt-1">
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
