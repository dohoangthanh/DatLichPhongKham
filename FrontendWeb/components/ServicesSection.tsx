'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Service {
  serviceId: number
  name: string
  type: string
  price: number
  imageUrl: string | null
}

const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'
        const response = await fetch(`${API_URL}/services`)
        if (response.ok) {
          const data = await response.json()
          console.log('Services data:', data) // Debug log
          console.log('First service imageUrl:', data[0]?.imageUrl) // Check image
          setServices(data.slice(0, 8)) // Lấy 8 dịch vụ
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current || isPaused || services.length === 0) return

    const scrollInterval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current
        const maxScroll = container.scrollWidth - container.clientWidth
        
        if (container.scrollLeft >= maxScroll - 10) {
          // Quay lại đầu khi đến cuối
          container.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          // Scroll sang trái
          container.scrollBy({ left: 350, behavior: 'smooth' })
        }
      }
    }, 3000) // Mỗi 3 giây

    return () => clearInterval(scrollInterval)
  }, [services, isPaused])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dịch vụ...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Dịch Vụ Y Tế
            </h2>
            <p className="text-gray-600">
              Cung cấp đầy đủ các dịch vụ khám chửa bệnh chuyên nghiệp
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Services Horizontal Scroll */}
        <div 
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {services.map((service) => (
            <div 
              key={service.serviceId}
              className="flex-none w-80 bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
            >
              {/* Service Image */}
              <div className="relative h-56 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                {service.imageUrl ? (
                  <Image
                    src={service.imageUrl.startsWith('http') ? service.imageUrl : `http://localhost:5129${service.imageUrl}`}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-20 h-20 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Service Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {service.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.type}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent font-bold text-xl">
                    {service.price.toLocaleString('vi-VN')}đ
                  </span>
                  <Link 
                    href="/register"
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent hover:from-cyan-700 hover:to-blue-700 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    Đặt lịch
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Xem tất cả dịch vụ
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

export default ServicesSection
