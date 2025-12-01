'use client'

import React from 'react'
import Image from 'next/image'

const MissionSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <div className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 text-sm font-medium mb-6">
              DỊCH VỤ & ĐỐI TÁC
            </div>

            {/* Heading */}
            <h2 className="text-3xl lg:text-4xl font-bold text-green-700 mb-6 uppercase">
              DỊCH VỤ Y TẾ VÀ ĐỐI TÁC
            </h2>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-6">
              Chúng tôi cung cấp nhiều dịch vụ chăm sóc sức khỏe tiêu chuẩn quốc tế, bao gồm:
            </p>

            {/* Services List */}
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <span className="text-green-700 font-bold">•</span>
                <span className="text-gray-600"><span className="font-bold text-gray-900">Dịch vụ bác sĩ gia đình:</span> Dành cho tất cả mọi người từ trẻ em đến người lớn, hỗ trợ điều trị các bệnh mãn tính và cấp tính.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-700 font-bold">•</span>
                <span className="text-gray-600"><span className="font-bold text-gray-900">Bác sĩ thăm khám tại nhà:</span> Đáp ứng nhu cầu chăm sóc sức khỏe tại nhà hoặc nơi làm việc.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-700 font-bold">•</span>
                <span className="text-gray-600"><span className="font-bold text-gray-900">Điều trị y tế ở nước ngoài và hộ tống:</span> Cung cấp bác sĩ riêng đi cùng các chuyên sơ tán và điều trị ra nước ngoài.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-700 font-bold">•</span>
                <span className="text-gray-600"><span className="font-bold text-gray-900">Chăm sóc sức khỏe chủ động:</span> Dịch vụ bổ sung vitamin và vi chất dinh dưỡng, khám sức khỏe định kỳ, tư vấn dinh dưỡng và lối sống.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-700 font-bold">•</span>
                <span className="text-gray-600"><span className="font-bold text-gray-900">Dịch vụ phòng thí nghiệm:</span> Thực hiện tại phòng khám hoặc tại nhà, bao gồm xét nghiệm máu, nước tiểu và nhiều dịch vụ khác.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-700 font-bold">•</span>
                <span className="text-gray-600"><span className="font-bold text-gray-900">siêu âm:</span> Với trang thiết bị hiện đại tại phòng khám, hỗ trợ chẩn đoán nhanh chóng và chính xác.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-700 font-bold">•</span>
                <span className="text-gray-600"><span className="font-bold text-gray-900">Trạm sơ cứu sự kiện:</span> Đội ngũ y tế chuyên nghiệp phục vụ các sự kiện công cộng và doanh nghiệp.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-700 font-bold">•</span>
                <span className="text-gray-600"><span className="font-bold text-gray-900">Cố vấn sức khỏe doanh nghiệp:</span> Hỗ trợ lập kế hoạch và thực hiện các chương trình chăm sóc sức khỏe nhân viên.</span>
              </li>
            </ul>

            <p className="text-gray-600 leading-relaxed text-sm">
              Ngoài ra, chúng tôi hợp tác với hầu hết các công ty bảo hiểm y tế trong nước và quốc tế, bao gồm cả bảo hiểm du lịch, để hỗ trợ khách hàng xử lý yêu cầu bồi thường y tế một cách nhanh chóng, nhanh chóng và thuận tiện.
            </p>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div className="relative h-[600px]">
                <Image
                  src="/images/components/Medical-900x650-1-900x615.jpg"
                  alt="Dịch vụ y tế chất lượng"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MissionSection
