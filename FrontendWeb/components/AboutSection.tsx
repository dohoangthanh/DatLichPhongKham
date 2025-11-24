'use client'

import React from 'react'

const AboutSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Về Phòng Khám Đa Khoa
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Với hơn 15 năm kinh nghiệm trong lĩnh vực chăm sóc sức khỏe, chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao và trải nghiệm tốt nhất cho bệnh nhân.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chất lượng hàng đầu</h3>
                    <p className="text-gray-600">
                      Đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại, quy trình khám chữa bệnh chuyên nghiệp
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Tiết kiệm thời gian</h3>
                    <p className="text-gray-600">
                      Đặt lịch trực tuyến dễ dàng, giảm thời gian chờ đợi, quy trình khám nhanh chóng
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chăm sóc tận tâm</h3>
                    <p className="text-gray-600">
                      Luôn lắng nghe, thấu hiểu và đồng hành cùng bệnh nhân trong quá trình điều trị
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-lg shadow-xl text-white">
                <h3 className="text-3xl font-bold mb-4">Tầm nhìn & Sứ mệnh</h3>
                <p className="text-blue-100 mb-6">
                  Trở thành phòng khám đa khoa hàng đầu, mang đến dịch vụ y tế toàn diện, chất lượng cao với chi phí hợp lý cho mọi người dân.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-blue-400">
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">15+</p>
                    <p className="text-sm text-blue-100">Năm kinh nghiệm</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">50+</p>
                    <p className="text-sm text-blue-100">Bác sĩ giỏi</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold mb-1">100K+</p>
                    <p className="text-sm text-blue-100">Bệnh nhân</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-2">🏥</div>
                  <h4 className="font-bold text-gray-800 mb-1">Cơ sở vật chất</h4>
                  <p className="text-sm text-gray-600">Hiện đại, tiện nghi</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-2">⚕️</div>
                  <h4 className="font-bold text-gray-800 mb-1">Đội ngũ y bác sĩ</h4>
                  <p className="text-sm text-gray-600">Chuyên môn cao</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-2">🔬</div>
                  <h4 className="font-bold text-gray-800 mb-1">Thiết bị</h4>
                  <p className="text-sm text-gray-600">Công nghệ tiên tiến</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <div className="text-4xl mb-2">💊</div>
                  <h4 className="font-bold text-gray-800 mb-1">Dược phẩm</h4>
                  <p className="text-sm text-gray-600">Chính hãng, uy tín</p>
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
