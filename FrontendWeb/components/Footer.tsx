import React from 'react'

import Image from 'next/image'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 text-white py-12 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 pointer-events-none"></div>
      
      <div className="max-w-screen-2xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Logo and Name */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-4 p-2 bg-white/20 backdrop-blur-sm rounded-full shadow-xl">
              <div className="relative w-full h-full bg-white rounded-full p-2">
                <Image
                  src="/images/logo.png"
                  alt="Logo Phòng Khám"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h3 className="text-3xl font-bold tracking-wide leading-tight drop-shadow-lg">
              PHÒNG KHÁM ĐA KHOA
            </h3>
          </div>

          {/* Right Column - Contact Information */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 group">
              <span className="text-xl mt-1 transform group-hover:scale-110 transition-transform duration-300">📍</span>
              <p className="text-lg text-white/90 group-hover:text-white transition-colors duration-300">42 Phạm Đình Hổ, Hai Bà Trưng, Hà Nội</p>
            </div>
            <div className="flex items-start gap-3 group">
              <span className="text-xl mt-1 transform group-hover:scale-110 transition-transform duration-300">📧</span>
              <p className="text-lg text-white/90 group-hover:text-white transition-colors duration-300">Email: info@medlatec.vn</p>
            </div>
            <div className="flex items-start gap-3 group">
              <span className="text-xl mt-1 transform group-hover:scale-110 transition-transform duration-300">📞</span>
              <p className="text-lg text-white/90 group-hover:text-white transition-colors duration-300">Đường dây nóng: 1900 565656</p>
            </div>
            <div className="flex items-start gap-3 group">
              <span className="text-xl mt-1 transform group-hover:scale-110 transition-transform duration-300">🌐</span>
              <p className="text-lg text-white/90 group-hover:text-white transition-colors duration-300">Trang web: medlatec.vn</p>
            </div>

            {/* Business License */}
            <div className="mt-8 pt-6 relative">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              <p className="text-sm leading-relaxed text-white/90">
                Giấy chứng nhận đăng ký kinh doanh số{' '}
                <strong className="text-white">01003230014</strong> do Sở KHĐT Hà Nội cấp ngày 06/01/2011.
              </p>
              <p className="text-sm mt-3 text-white/80">© 2025 MEDLATEC. Design by Yis Market</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
