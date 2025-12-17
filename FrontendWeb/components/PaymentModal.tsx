'use client'

import { useState, useEffect } from 'react'
import { paymentApi } from '@/services/patientApi'
import QRCode from 'qrcode'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: number
  totalAmount: number
}

export default function PaymentModal({
  isOpen,
  onClose,
  appointmentId,
  totalAmount
}: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [qrImageUrl, setQrImageUrl] = useState<string>('')
  const [paymentStatus, setPaymentStatus] = useState<string>('Pending')
  const [promoCode, setPromoCode] = useState('')

  useEffect(() => {
    if (paymentData?.qrCodeUrl) {
      // VietQR.io trả về URL ảnh QR trực tiếp, không cần generate
      // QR này tự động điền đầy đủ: ngân hàng, STK, số tiền, nội dung
      setQrImageUrl(paymentData.qrCodeUrl)
    }
  }, [paymentData])

  useEffect(() => {
    if (!paymentData?.paymentId) return

    console.log('🔄 Starting payment polling for Payment ID:', paymentData.paymentId)

    // Poll payment status every 3 seconds
    const interval = setInterval(async () => {
      try {
        console.log('📡 Polling payment status...')
        const status = await paymentApi.getStatus(paymentData.paymentId)
        console.log('✅ Payment status received:', status)
        setPaymentStatus(status.status)
        
        if (status.status === 'Paid') {
          console.log('🎉 Payment confirmed as PAID!')
          clearInterval(interval)
          setTimeout(() => {
            onClose()
            window.location.reload()
          }, 2000)
        }
      } catch (error) {
        console.error('❌ Error checking payment status:', error)
      }
    }, 3000)

    return () => {
      console.log('⏹️ Stopping payment polling')
      clearInterval(interval)
    }
  }, [paymentData, onClose])

  const handleCreatePayment = async () => {
    setLoading(true)
    try {
      const result = await paymentApi.create({
        appointmentId,
        totalAmount,
        paymentMethod: 'bank_transfer',
        promoCode: promoCode || undefined
      })
      
      setPaymentData(result)
    } catch (error: any) {
      alert(error.message || 'Không thể tạo thanh toán')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Đã sao chép!')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Thanh toán</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!paymentData ? (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền thanh toán
                </label>
                <div className="text-3xl font-bold text-blue-600">
                  {totalAmount.toLocaleString('vi-VN')} ₫
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá (tùy chọn)
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleCreatePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Đang tạo...' : 'Tạo mã thanh toán'}
              </button>
            </div>
          ) : (
            <div>
              {paymentStatus === 'Paid' ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h3>
                  <p className="text-gray-600">Đang chuyển hướng...</p>
                </div>
              ) : (
                <div>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Quét mã QR hoặc chuyển khoản theo thông tin bên dưới. <br/>
                          Thanh toán sẽ tự động xác nhận sau khi chuyển khoản thành công.
                        </p>
                      </div>
                    </div>
                  </div>

                  {qrImageUrl && (
                    <div className="text-center mb-6">
                      <img 
                        src={qrImageUrl} 
                        alt="VietQR Payment Code" 
                        className="mx-auto border-4 border-gray-200 rounded-lg shadow-lg max-w-sm"
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}

                  {/* Thông tin cuộc hẹn */}
                  {paymentData.appointmentInfo && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Thông tin cuộc hẹn
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bác sĩ:</span>
                          <span className="font-semibold">{paymentData.appointmentInfo.doctorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Khoa:</span>
                          <span className="font-semibold">{paymentData.appointmentInfo.specialtyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thời gian:</span>
                          <span className="font-semibold">
                            {paymentData.appointmentInfo.appointmentTime} - {paymentData.appointmentInfo.appointmentDate}
                          </span>
                        </div>
                        {paymentData.appointmentInfo.services && paymentData.appointmentInfo.services.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="font-semibold text-gray-700 mb-2">Dịch vụ:</div>
                            {paymentData.appointmentInfo.services.map((service: any, index: number) => (
                              <div key={index} className="flex justify-between text-xs ml-4">
                                <span>• {service.serviceName}</span>
                                <span className="text-gray-600">{service.price.toLocaleString('vi-VN')} ₫</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ngân hàng:</span>
                      <span className="font-semibold">{paymentData.bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Số tài khoản:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{paymentData.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(paymentData.accountNumber)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Chủ tài khoản:</span>
                      <span className="font-semibold">{paymentData.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-semibold text-lg text-red-600">
                        {paymentData.totalAmount.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t pt-3">
                      <span className="text-gray-600">Nội dung CK:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600">{paymentData.transferContent}</span>
                        <button
                          onClick={() => copyToClipboard(paymentData.transferContent)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Đang chờ thanh toán...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
