'use client'

import Image from 'next/image'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function AboutPage() {
  const qualities = [
    {
      title: 'Chất lượng hàng đầu',
      description: 'Đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: 'Tiết kiệm thời gian',
      description: 'Đặt lịch online nhanh chóng, không phải chờ đợi',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Chăm sóc tận tâm',
      description: 'Theo dõi sức khỏe định kỳ, tư vấn 24/7',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ]

  const stats = [
    { value: '15+', label: 'Năm kinh nghiệm' },
    { value: '50+', label: 'Bác sĩ chuyên khoa' },
    { value: '100K+', label: 'Bệnh nhân tin tưởng' },
    { value: '98%', label: 'Hài lòng dịch vụ' }
  ]

  const facilities = [
    {
      title: 'Trang thiết bị hiện đại',
      description: 'Máy móc, thiết bị y tế đạt chuẩn quốc tế'
    },
    {
      title: 'Phòng khám sạch sẽ',
      description: 'Không gian thoáng mát, vệ sinh đảm bảo'
    },
    {
      title: 'Quy trình chuyên nghiệp',
      description: 'Đặt lịch - khám bệnh - thanh toán tiện lợi'
    },
    {
      title: 'Hỗ trợ 24/7',
      description: 'Tư vấn và hỗ trợ khách hàng mọi lúc mọi nơi'
    }
  ]

  return (
    <main>
      <Header />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Về Phòng Khám Của Chúng Tôi
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Với hơn 15 năm kinh nghiệm, chúng tôi tự hào là địa chỉ khám chữa bệnh 
              uy tín, chất lượng hàng đầu tại Việt Nam
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section with Image */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 text-sm font-medium mb-6">
                SỨ MỆNH & GIÁ TRỊ
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-blue-500 mb-6 uppercase">
                CAM KẾT CHĂM SÓC CHẤT LƯỢNG
              </h2>

              <p className="text-gray-600 leading-relaxed mb-4">
                Bằng cách kết hợp sự hiểu biết sâu sắc về nhu cầu của cộng đồng với kiến thức chuyên môn về các dịch vụ y tế và chăm sóc sức khỏe, giải pháp điều trị ở nước ngoài và hệ thống pháp luật địa phương, chúng tôi có thể hợp tác với các phòng khám và bệnh viện chuyên khoa cả trong nước và quốc tế để cung cấp phản hồi kịp thời và hiệu quả cho các tình huống y tế đa dạng.
              </p>

              <p className="text-gray-600 leading-relaxed mb-6">
                <span className="font-bold text-gray-900">Phòng Khám Đa Khoa</span> cam kết thực hiện các giá trị cốt lõi và sứ mệnh cung cấp các dịch vụ chăm sóc sức khỏe và thể chất chất lượng cao, tiêu chuẩn quốc tế với chi phí hợp lý cho người dân Việt Nam, khách du lịch quốc tế, người nước ngoài và các tổ chức toàn cầu tại Việt Nam.
              </p>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <div className="relative h-[500px]">
                  <Image
                    src="/images/components/Medical-900x650-1-900x615.jpg"
                    alt="Đội ngũ y tế chuyên nghiệp"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services & Partners Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <div className="relative h-[500px]">
                  <Image
                    src="/images/components/laboratory-720x720-1-720x615.jpg"
                    alt="Dịch vụ y tế chất lượng"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 text-sm font-medium mb-6">
                DỊCH VỤ & ĐỐI TÁC
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-blue-500 mb-6 uppercase">
                DỊCH VỤ Y TẾ VÀ ĐỐI TÁC
              </h2>

              <p className="text-gray-600 leading-relaxed mb-6">
                Chúng tôi cung cấp nhiều dịch vụ chăm sóc sức khỏe tiêu chuẩn quốc tế, bao gồm:
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <span className="text-gray-600"><span className="font-bold text-gray-900">Dịch vụ bác sĩ gia đình:</span> Dành cho tất cả mọi người từ trẻ em đến người lớn.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <span className="text-gray-600"><span className="font-bold text-gray-900">Bác sĩ thăm khám tại nhà:</span> Đáp ứng nhu cầu chăm sóc sức khỏe tại nhà.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <span className="text-gray-600"><span className="font-bold text-gray-900">Điều trị y tế ở nước ngoài:</span> Cung cấp bác sĩ riêng đi cùng.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <span className="text-gray-600"><span className="font-bold text-gray-900">Chăm sóc sức khỏe chủ động:</span> Khám sức khỏe định kỳ, tư vấn dinh dưỡng.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">•</span>
                  <span className="text-gray-600"><span className="font-bold text-gray-900">Dịch vụ xét nghiệm:</span> Thực hiện tại phòng khám hoặc tại nhà.</span>
                </li>
              </ul>

              <p className="text-gray-600 leading-relaxed text-sm">
                Ngoài ra, chúng tôi hợp tác với hầu hết các công ty bảo hiểm y tế trong nước và quốc tế để hỗ trợ khách hàng một cách thuận tiện.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 text-white">
            <div>
              <h2 className="text-3xl font-bold mb-4">Tầm Nhìn</h2>
              <p className="text-lg leading-relaxed">
                Trở thành hệ thống phòng khám hàng đầu Việt Nam, tiên phong trong việc 
                ứng dụng công nghệ số để mang đến trải nghiệm khám chữa bệnh hiện đại, 
                tiện lợi và hiệu quả nhất cho người dân.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">Sứ Mệnh</h2>
              <p className="text-lg leading-relaxed">
                Cung cấp dịch vụ y tế chất lượng cao, chăm sóc sức khỏe toàn diện cho 
                cộng đồng. Đào tạo đội ngũ y bác sĩ chuyên nghiệp, tận tâm với nghề nghiệp 
                và luôn đặt lợi ích bệnh nhân lên hàng đầu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Con Số Ấn Tượng
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Cơ Sở Vật Chất
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{facility.title}</h3>
                <p className="text-gray-600 text-sm">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Sẵn Sàng Chăm Sóc Sức Khỏe Của Bạn
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Đặt lịch khám ngay hôm nay để được tư vấn và khám bệnh bởi đội ngũ bác sĩ chuyên nghiệp
          </p>
          <a 
            href="/patient/booking" 
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Đặt Lịch Khám Ngay
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
