'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function CareersPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    cv: null as File | null,
    coverLetter: ''
  })

  const [submitted, setSubmitted] = useState(false)

  const positions = [
    {
      title: 'Bác Sĩ Đa Khoa',
      department: 'Khám bệnh',
      type: 'Full-time',
      location: 'TP. Hồ Chí Minh',
      requirements: [
        'Bằng Bác sĩ đa khoa từ trường đại học uy tín',
        'Có chứng chỉ hành nghề',
        'Ít nhất 2 năm kinh nghiệm',
        'Kỹ năng giao tiếp tốt'
      ],
      benefits: [
        'Lương cạnh tranh 20-30 triệu',
        'Bảo hiểm sức khỏe',
        'Đào tạo nâng cao',
        'Môi trường chuyên nghiệp'
      ]
    },
    {
      title: 'Điều Dưỡng',
      department: 'Chăm sóc bệnh nhân',
      type: 'Full-time',
      location: 'TP. Hồ Chí Minh',
      requirements: [
        'Bằng Cao đẳng/Đại học Điều dưỡng',
        'Có chứng chỉ hành nghề',
        'Kinh nghiệm tối thiểu 1 năm',
        'Nhiệt tình, tận tâm'
      ],
      benefits: [
        'Lương 10-15 triệu',
        'Phụ cấp ca đêm',
        'Đào tạo kỹ năng',
        'Thưởng hiệu suất'
      ]
    },
    {
      title: 'Kỹ Thuật Viên Xét Nghiệm',
      department: 'Xét nghiệm',
      type: 'Full-time',
      location: 'TP. Hồ Chí Minh',
      requirements: [
        'Tốt nghiệp chuyên ngành Y Dược',
        'Am hiểu thiết bị xét nghiệm',
        'Cẩn thận, tỉ mỉ',
        'Có thể làm ca'
      ],
      benefits: [
        'Lương 8-12 triệu',
        'Bảo hiểm đầy đủ',
        'Đào tạo chuyên môn',
        'Phụ cấp ca đêm'
      ]
    },
    {
      title: 'Nhân Viên Lễ Tân',
      department: 'Tiếp đón',
      type: 'Full-time',
      location: 'TP. Hồ Chí Minh',
      requirements: [
        'Tốt nghiệp THPT trở lên',
        'Ngoại hình khá, giao tiếp tốt',
        'Thành thạo tin học văn phòng',
        'Kinh nghiệm là lợi thế'
      ],
      benefits: [
        'Lương 7-10 triệu',
        'Môi trường năng động',
        'Đào tạo kỹ năng mềm',
        'Cơ hội thăng tiến'
      ]
    },
    {
      title: 'IT Support',
      department: 'Công nghệ thông tin',
      type: 'Full-time',
      location: 'TP. Hồ Chí Minh',
      requirements: [
        'Tốt nghiệp chuyên ngành CNTT',
        'Kinh nghiệm quản trị hệ thống',
        'Biết lập trình web là lợi thế',
        'Giải quyết vấn đề tốt'
      ],
      benefits: [
        'Lương 12-18 triệu',
        'Làm việc với công nghệ mới',
        'Đào tạo chuyên sâu',
        'Thưởng dự án'
      ]
    },
    {
      title: 'Dược Sĩ',
      department: 'Nhà thuốc',
      type: 'Full-time',
      location: 'TP. Hồ Chí Minh',
      requirements: [
        'Bằng Dược sĩ Đại học',
        'Có chứng chỉ hành nghề',
        'Hiểu biết về thuốc',
        'Tư vấn bệnh nhân tốt'
      ],
      benefits: [
        'Lương 12-18 triệu',
        'Hoa hồng doanh số',
        'Đào tạo kiến thức mới',
        'Môi trường chuyên nghiệp'
      ]
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement API call to submit application
    console.log('Application submitted:', formData)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, cv: e.target.files![0] }))
    }
  }

  return (
    <main>
      <Header />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Cơ Hội Nghề Nghiệp
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Gia nhập đội ngũ của chúng tôi để cùng nhau chăm sóc sức khỏe cộng đồng
            </p>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Tại Sao Nên Làm Việc Với Chúng Tôi?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Thu Nhập Hấp Dẫn</h3>
              <p className="text-gray-600 text-sm">Mức lương cạnh tranh, thưởng hiệu suất định kỳ</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Phát Triển Sự Nghiệp</h3>
              <p className="text-gray-600 text-sm">Đào tạo chuyên môn, cơ hội thăng tiến rõ ràng</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Môi Trường Chuyên Nghiệp</h3>
              <p className="text-gray-600 text-sm">Đồng nghiệp thân thiện, cơ sở vật chất hiện đại</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Phúc Lợi Đầy Đủ</h3>
              <p className="text-gray-600 text-sm">BHXH, BHYT, du lịch, team building định kỳ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Vị Trí Đang Tuyển Dụng
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {positions.map((position, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{position.title}</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                    {position.type}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {position.department}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {position.location}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">Yêu cầu:</h4>
                  <ul className="space-y-1">
                    {position.requirements.slice(0, 3).map((req, idx) => (
                      <li key={idx} className="text-gray-600 text-sm flex items-start">
                        <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <a 
                  href="#apply" 
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Ứng tuyển ngay
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Nộp Hồ Sơ Ứng Tuyển
            </h2>
            <p className="text-gray-600">
              Điền thông tin và gửi CV của bạn, chúng tôi sẽ liên hệ trong vòng 7 ngày
            </p>
          </div>

          {submitted && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Cảm ơn bạn đã ứng tuyển! Chúng tôi sẽ liên hệ sớm nhất.
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Vị trí ứng tuyển <span className="text-red-500">*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn vị trí</option>
                  {positions.map((pos, idx) => (
                    <option key={idx} value={pos.title}>{pos.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Số năm kinh nghiệm
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                CV (PDF, DOC, DOCX) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Thư giới thiệu
              </label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                rows={4}
                placeholder="Viết vài dòng về bản thân và lý do bạn muốn làm việc tại đây..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Gửi hồ sơ ứng tuyển
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}
