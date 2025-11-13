'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import DepartmentsSection from '@/components/DepartmentsSection'
import Footer from '@/components/Footer'
import ChatbotBubble from '@/components/ChatbotBubble'

export default function PatientHome() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Patient')) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
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
    <main>
      <Header />
      <Navigation />
      <HeroSection />
      
      {/* Quick Actions for Patient */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/patient/booking')}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-blue-500"
            >
              <div className="text-4xl mb-3 text-center">📅</div>
              <h3 className="text-xl font-semibold text-blue-600 text-center mb-2">
                Đặt Lịch Khám
              </h3>
              <p className="text-gray-600 text-center">
                Đặt lịch khám với bác sĩ nhanh chóng
              </p>
            </button>

            <button
              onClick={() => router.push('/patient/history')}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3 text-center">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
                Lịch Sử Khám
              </h3>
              <p className="text-gray-600 text-center">
                Xem lại lịch sử khám bệnh của bạn
              </p>
            </button>

            <button
              onClick={() => router.push('/patient/profile')}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3 text-center">👤</div>
              <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
                Thông Tin Cá Nhân
              </h3>
              <p className="text-gray-600 text-center">
                Quản lý thông tin tài khoản
              </p>
            </button>
          </div>
        </div>
      </section>

      <DepartmentsSection />
      <Footer />
      <ChatbotBubble />
    </main>
  )
}
