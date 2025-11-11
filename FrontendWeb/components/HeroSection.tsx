import React from 'react'
import Image from 'next/image'

const HeroSection: React.FC = () => {
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Phòng Khám Đa Khoa
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Chào mừng bạn đến với phòng khám đa khoa. Chúng tôi cung cấp các dịch vụ y tế chuyên nghiệp và tận tâm.
          </p>
        </div>

        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden shadow-xl max-w-5xl mx-auto">
          <div className="relative h-96 bg-gradient-to-r from-gray-100 to-gray-200">
            {/* Banner ảnh phòng khám */}
            <Image
              src="/images/hero-banner.jpg"
              alt="Phòng khám đa khoa"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
