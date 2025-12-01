'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface LoyaltyPointsData {
  pointsId: number
  points: number
  lastUpdated: string
  patientId: number
}

export default function LoyaltyPointsPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyPointsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Patient')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (token && user?.role === 'Patient') {
      fetchLoyaltyPoints()
    }
  }, [token, user])

  const fetchLoyaltyPoints = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/loyaltypoints/my-points`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLoyaltyData(data)
      }
    } catch (error) {
      console.error('Error fetching loyalty points:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (!user || user.role !== 'Patient') {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Điểm Tích Lũy</h1>

          {/* Main Points Card */}
          <div className="bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-2xl shadow-xl p-8 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-2">Điểm hiện có</p>
                <p className="text-5xl font-bold mb-4">{loyaltyData?.points || 0}</p>
                <p className="text-amber-100 text-sm">
                  Cập nhật lần cuối: {loyaltyData?.lastUpdated ? formatDate(loyaltyData.lastUpdated) : 'N/A'}
                </p>
              </div>
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          {/* How to Earn Points */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cách Tích Điểm
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Thanh toán dịch vụ</p>
                  <p className="text-sm text-gray-600">Nhận 1 điểm cho mỗi 10,000 VNĐ thanh toán</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Khám định kỳ</p>
                  <p className="text-sm text-gray-600">Điểm thưởng cho khách hàng thường xuyên</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Giới thiệu bạn bè</p>
                  <p className="text-sm text-gray-600">Nhận điểm khi giới thiệu bạn bè đến phòng khám</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Tiers */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hạng Thành Viên
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border-2 ${loyaltyData && loyaltyData.points < 100 ? 'border-gray-400 bg-gray-50' : 'border-gray-200'}`}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold">🥉</span>
                  </div>
                  <p className="font-bold text-gray-800">Đồng</p>
                  <p className="text-sm text-gray-600 mt-1">0 - 99 điểm</p>
                  <p className="text-xs text-gray-500 mt-2">Giảm 5% cho lần khám tiếp theo</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${loyaltyData && loyaltyData.points >= 100 && loyaltyData.points < 500 ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold">🥈</span>
                  </div>
                  <p className="font-bold text-gray-800">Bạc</p>
                  <p className="text-sm text-gray-600 mt-1">100 - 499 điểm</p>
                  <p className="text-xs text-gray-500 mt-2">Giảm 10% + Ưu tiên đặt lịch</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${loyaltyData && loyaltyData.points >= 500 ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-white font-bold">🥇</span>
                  </div>
                  <p className="font-bold text-gray-800">Vàng</p>
                  <p className="text-sm text-gray-600 mt-1">500+ điểm</p>
                  <p className="text-xs text-gray-500 mt-2">Giảm 15% + VIP Support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-semibold mb-2">Điều khoản chương trình</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Điểm tích lũy có hiệu lực trong vòng 12 tháng kể từ ngày tích</li>
              <li>• Điểm không thể chuyển nhượng cho người khác</li>
              <li>• Phòng khám có quyền thay đổi điều khoản chương trình</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
