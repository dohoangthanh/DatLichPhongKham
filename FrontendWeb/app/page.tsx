'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import SearchSection from '@/components/SearchSection'
import TeamSection from '@/components/TeamSection'
import GuideSection from '@/components/GuideSection'
import DepartmentsSection from '@/components/DepartmentsSection'
import PricingTable from '@/components/PricingTable'
import CTAButtons from '@/components/CTAButtons'
import Footer from '@/components/Footer'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Admin') {
        router.replace('/admin/dashboard')
      } else if (user.role === 'Doctor') {
        router.replace('/doctor/schedule')
      } else if (user.role === 'Patient') {
        router.replace('/patient')
      }
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

  // Don't render home page for logged-in users
  if (user) {
    return null
  }

  return (
    <main>
      <Header />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <SearchSection />
      <TeamSection />
      <GuideSection />
      <DepartmentsSection />
      <PricingTable />
      <CTAButtons />
      <Footer />
    </main>
  )
}
