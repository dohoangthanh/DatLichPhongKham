'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import DepartmentsSection from '@/components/DepartmentsSection'
import PricingTable from '@/components/PricingTable'
import CTAButtons from '@/components/CTAButtons'
import Footer from '@/components/Footer'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && user.role === 'Admin') {
      router.replace('/admin/dashboard')
    }
  }, [user, loading, router])

  // Show loading while checking auth
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

  // Don't render home page for Admin users
  if (user && user.role === 'Admin') {
    return null
  }

  return (
    <main>
      <Header />
      <Navigation />
      <HeroSection />
      <DepartmentsSection />
      <PricingTable />
      <CTAButtons />
      <Footer />
    </main>
  )
}
