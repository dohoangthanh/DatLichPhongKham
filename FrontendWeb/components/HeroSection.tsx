import React from 'react'
import Image from 'next/image'

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-b from-white via-cyan-50/30 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Image with smooth shadow */}
        <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl mb-10 transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.01]">
          <Image
            src="/images/hero-banner.jpg"
            alt="Phòng khám đa khoa"
            fill
            className="object-cover"
            priority
          />
          {/* Gradient overlay for smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>

        {/* Title and Description with smooth animation */}
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Phòng Khám Đa Khoa
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chào mừng bạn đến với phòng khám đa khoa. Chúng tôi cung cấp các dịch vụ y tế chuyên nghiệp và tận tâm.
          </p>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
