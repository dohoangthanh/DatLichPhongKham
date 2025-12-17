'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ZaloPayQRProps {
  paymentId: number
  qrCodeUrl: string
  totalAmount: number
  onPaymentSuccess?: () => void
}

export default function ZaloPayQR({ paymentId, qrCodeUrl, totalAmount, onPaymentSuccess }: ZaloPayQRProps) {
  const [status, setStatus] = useState<'pending' | 'checking' | 'paid' | 'failed'>('pending')
  const [countdown, setCountdown] = useState(300) // 5 minutes

  useEffect(() => {
    // Poll payment status every 3 seconds
    const statusInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/zalopay-status/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.status === 'Paid') {
            setStatus('paid')
            clearInterval(statusInterval)
            clearInterval(countdownInterval)
            if (onPaymentSuccess) {
              onPaymentSuccess()
            }
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }, 3000)

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(statusInterval)
          clearInterval(countdownInterval)
          setStatus('failed')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(statusInterval)
      clearInterval(countdownInterval)
    }
  }, [paymentId, onPaymentSuccess])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (status === 'paid') {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h3>
        <p className="text-gray-600">Cảm ơn bạn đã thanh toán</p>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-red-600 mb-2">Hết thời gian thanh toán</h3>
        <p className="text-gray-600">Vui lòng thử lại</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Image src="/images/zalopay-logo.png" alt="ZaloPay" width={40} height={40} className="rounded" />
          <h2 className="text-2xl font-bold text-gray-900">ZaloPay</h2>
        </div>
        <p className="text-gray-600">Quét mã QR để thanh toán</p>
      </div>

      {/* Amount */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600 text-center mb-1">Số tiền thanh toán</p>
        <p className="text-3xl font-bold text-center text-blue-600">{formatCurrency(totalAmount)}</p>
      </div>

      {/* QR Code */}
      <div className="bg-white border-4 border-blue-500 rounded-xl p-4 mb-6">
        {qrCodeUrl ? (
          <div className="relative w-full aspect-square">
            <Image
              src={qrCodeUrl}
              alt="ZaloPay QR Code"
              fill
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            1
          </div>
          <p className="text-sm text-gray-700">Mở ứng dụng <strong>ZaloPay</strong> trên điện thoại</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            2
          </div>
          <p className="text-sm text-gray-700">Chọn <strong>Quét mã QR</strong></p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
            3
          </div>
          <p className="text-sm text-gray-700">Quét mã QR và xác nhận thanh toán</p>
        </div>
      </div>

      {/* Timer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-yellow-800">Thời gian còn lại:</span>
          <span className="text-xl font-bold text-yellow-800">{formatTime(countdown)}</span>
        </div>
      </div>

      {/* Status */}
      {status === 'checking' && (
        <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm">Đang kiểm tra thanh toán...</span>
        </div>
      )}
    </div>
  )
}
