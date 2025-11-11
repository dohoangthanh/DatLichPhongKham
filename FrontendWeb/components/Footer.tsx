import React from 'react'

import Image from 'next/image'

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-600 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Logo and Name */}
          <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-4">
              <Image
                src="/images/logo.png"
                alt="Logo Phòng Khám"
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-3xl font-bold tracking-wide leading-tight">
              PHÒNG KHÁM ĐA KHOA
            </h3>
          </div>

          {/* Right Column - Contact Information */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-1">📍</span>
              <p className="text-lg">42 Phạm Đình Hổ, Hai Bà Trưng, Hà Nội</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-1">📧</span>
              <p className="text-lg">Email: info@medlatec.vn</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-1">📞</span>
              <p className="text-lg">Đường dây nóng: 1900 565656</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl mt-1">🌐</span>
              <p className="text-lg">Trang web: medlatec.vn</p>
            </div>

            {/* Business License */}
            <div className="mt-8 pt-6">
              <p className="text-sm leading-relaxed">
                Giấy chứng nhận đăng ký kinh doanh số{' '}
                <strong>01003230014</strong> do Sở KHĐT Hà Nội cấp ngày 06/01/2011.
              </p>
              <p className="text-sm mt-3">© 2025 MEDLATEC. Design by Yis Market</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
