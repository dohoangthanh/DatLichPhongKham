'use client'

import React from 'react'

interface GuideStep {
  step: number
  title: string
  description: string
  icon: string
}

const GuideSection: React.FC = () => {
  const steps: GuideStep[] = [
    {
      step: 1,
      title: 'Đăng ký tài khoản',
      description: 'Tạo tài khoản miễn phí chỉ với vài bước đơn giản. Điền đầy đủ thông tin cá nhân để được phục vụ tốt nhất.',
      icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
    },
    {
      step: 2,
      title: 'Chọn chuyên khoa & bác sĩ',
      description: 'Tìm kiếm và lựa chọn chuyên khoa phù hợp. Xem thông tin chi tiết về đội ngũ bác sĩ giàu kinh nghiệm.',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    },
    {
      step: 3,
      title: 'Đặt lịch khám',
      description: 'Chọn ngày giờ khám thuận tiện. Hệ thống sẽ tự động kiểm tra lịch trống và xác nhận lịch hẹn cho bạn.',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      step: 4,
      title: 'Đến phòng khám',
      description: 'Đến phòng khám đúng giờ hẹn. Xuất trình mã lịch hẹn tại quầy lễ tân để được phục vụ nhanh chóng.',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },
    {
      step: 5,
      title: 'Khám bệnh',
      description: 'Bác sĩ sẽ thăm khám và tư vấn. Hồ sơ khám bệnh được lưu trữ điện tử an toàn và bảo mật.',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      step: 6,
      title: 'Thanh toán & Nhận kết quả',
      description: 'Thanh toán dễ dàng qua nhiều hình thức. Nhận kết quả khám và đơn thuốc. Có thể tra cứu online sau này.',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Hướng Dẫn Khách Hàng
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Quy trình đặt lịch và khám bệnh đơn giản, nhanh chóng chỉ với 6 bước. Chúng tôi luôn sẵn sàng hỗ trợ bạn.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {steps.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 relative"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                  {item.step}
                </div>
                
                <div className="mt-4 mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm text-center leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-blue-600 rounded-xl shadow-xl p-8 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">Cần hỗ trợ?</h3>
                <p className="text-blue-100 mb-6">
                  Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Đừng ngần ngại liên hệ khi cần giúp đỡ!
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-lg font-semibold">Hotline: 1900 565 656</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-lg font-semibold">Email: support@phongkham.vn</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-bold">Giờ làm việc</h4>
                  </div>
                  <p className="text-blue-100 text-sm">Thứ 2 - Thứ 7: 7:00 - 20:00</p>
                  <p className="text-blue-100 text-sm">Chủ nhật: 8:00 - 17:00</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h4 className="font-bold">Địa chỉ</h4>
                  </div>
                  <p className="text-blue-100 text-sm">123 Đường ABC, Quận 1, TP.HCM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GuideSection
