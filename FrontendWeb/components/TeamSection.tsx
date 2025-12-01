'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Doctor {
  doctorId: number
  name: string
  specialty: {
    specialtyId: number
    name: string
  } | null
  phone: string
  imageUrl?: string
}

interface Stats {
  doctorCount: number
  specialtyCount: number
  satisfactionRate: number
  support24_7: boolean
}

const TeamSection: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [stats, setStats] = useState<Stats>({
    doctorCount: 50,
    specialtyCount: 30,
    satisfactionRate: 98,
    support24_7: true
  })
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'
        
        // Fetch doctors
        const doctorsResponse = await fetch(`${API_URL}/doctors`)
        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json()
          setDoctors(doctorsData.slice(0, 8))
        }

        // Fetch statistics
        const statsResponse = await fetch(`${API_URL}/statistics/homepage`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current || isPaused || doctors.length === 0) return

    const scrollInterval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current
        const maxScroll = container.scrollWidth - container.clientWidth
        
        if (container.scrollLeft >= maxScroll - 5) {
          // Quay lại đầu khi đến cuối
          container.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          // Scroll nhỏ từng chút để mượt hơn
          container.scrollBy({ left: 1, behavior: 'auto' })
        }
      }
    }, 15) // Mỗi 15ms để animation mượt

    return () => clearInterval(scrollInterval)
  }, [doctors, isPaused])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải thông tin bác sĩ...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Găp Gỡ Đội Ngũ Bác Sĩ Của Chúng Tôi
          </h2>
          <p className="text-gray-600">
            Phòng khám tự hào sở hữu đội ngũ bác sĩ giàu kinh nghiệm, được đào tạo bài bản trong và ngoài nước. Trong đó, có bác sĩ đã từng làm việc tại Hoa Kỳ và Vương quốc Anh hoặc nhiều cơ sở quốc tế uy tín.
          </p>
        </div>

        {/* Doctors Horizontal Scroll */}
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {doctors.map((doctor) => (
            <div 
              key={doctor.doctorId}
              className="flex-none w-72 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow group"
            >
              {/* Doctor Image */}
              <div className="relative h-80 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                {doctor.imageUrl ? (
                  <Image
                    src={doctor.imageUrl.startsWith('http') ? doctor.imageUrl : `http://localhost:5129${doctor.imageUrl}`}
                    alt={doctor.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                      <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Doctor Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{doctor.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-sm bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{doctor.specialty?.name || 'Đa khoa'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm">{doctor.phone}</span>
                  </div>
                </div>
                <Link
                  href="/register"
                  className="block w-full text-center py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all font-medium"
                >
                  Đặt lịch khám
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-8 mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">{stats.doctorCount}+</p>
              <p className="text-gray-700 font-medium">Bác sĩ chuyên khoa</p>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">{stats.specialtyCount}+</p>
              <p className="text-gray-700 font-medium">Chuyên khoa</p>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">{stats.satisfactionRate}%</p>
              <p className="text-gray-700 font-medium">Hài lòng</p>
            </div>
            <div>
              <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">24/7</p>
              <p className="text-gray-700 font-medium">Hỗ trợ</p>
            </div>
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            href="/doctors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Xem tất cả bác sĩ
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}

export default TeamSection
