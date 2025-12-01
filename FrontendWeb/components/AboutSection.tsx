'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const AboutSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 rounded-full text-gray-600 text-sm font-medium mb-6">
              VỀ CHÚNG TÔI
            </div>

            {/* Heading */}
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 uppercase">
              CHUYÊN MÔN Y TẾ VÀ
            </h2>
            <h3 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6 uppercase">
              CHĂM SÓC SỨC KHỎE
            </h3>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8">
              Chúng tôi cung cấp dịch vụ chăm sóc toàn diện và cá nhân hóa cho từng bệnh nhân 
              bằng phương pháp tiếp cận dựa trên bằng chứng kết hợp với y học lâm sàng.
            </p>

            {/* Button */}
            <Link 
              href="/about"
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full font-medium hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              ĐỌC THÊM
            </Link>
          </div>

          {/* Right Images - Stacked Layout */}
          <div className="relative">
            {/* Main large image - Top */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-4">
              <div className="relative h-64">
                <Image
                  src="/images/components/Medical-900x650-1-900x615.jpg"
                  alt="Đội ngũ y tế"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Bottom row - 2 smaller images */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <div className="relative h-56">
                  <Image
                    src="/images/components/laboratory-720x720-1-720x615.jpg"
                    alt="Bác sĩ khám bệnh"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <div className="relative h-56">
                  <Image
                    src="/images/components/medical-insurance-720x720-1-720x.jpg"
                    alt="Cơ sở vật chất"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
