'use client'

import React from 'react'

interface Doctor {
  id: number
  name: string
  specialty: string
  experience: string
  education: string
  description: string
}

const TeamSection: React.FC = () => {
  const doctors: Doctor[] = [
    {
      id: 1,
      name: 'BS. Nguyễn Văn An',
      specialty: 'Tim mạch',
      experience: '20 năm kinh nghiệm',
      education: 'Bác sĩ chuyên khoa II - ĐH Y Hà Nội',
      description: 'Chuyên điều trị các bệnh lý tim mạch, tăng huyết áp, nhồi máu cơ tim'
    },
    {
      id: 2,
      name: 'BS. Trần Thị Bình',
      specialty: 'Nhi khoa',
      experience: '15 năm kinh nghiệm',
      education: 'Thạc sĩ Y học - ĐH Y Dược TP.HCM',
      description: 'Chuyên khám và điều trị các bệnh lý về trẻ em, tiêm chủng'
    },
    {
      id: 3,
      name: 'BS. Lê Minh Châu',
      specialty: 'Da liễu',
      experience: '12 năm kinh nghiệm',
      education: 'Bác sĩ chuyên khoa I - ĐH Y Huế',
      description: 'Chuyên điều trị mụn, nám, sẹo, các bệnh lý về da'
    },
    {
      id: 4,
      name: 'BS. Phạm Hoàng Dũng',
      specialty: 'Tiêu hóa',
      experience: '18 năm kinh nghiệm',
      education: 'Tiến sĩ Y học - ĐH Y Hà Nội',
      description: 'Chuyên điều trị viêm gan, viêm dạ dày, hội chứng ruột kích thích'
    },
    {
      id: 5,
      name: 'BS. Võ Thị Em',
      specialty: 'Sản phụ khoa',
      experience: '16 năm kinh nghiệm',
      education: 'Bác sĩ chuyên khoa II - ĐH Y Dược TP.HCM',
      description: 'Chuyên khám thai, siêu âm 4D, điều trị vô sinh hiếm muộn'
    },
    {
      id: 6,
      name: 'BS. Đỗ Văn Phúc',
      specialty: 'Tai mũi họng',
      experience: '14 năm kinh nghiệm',
      education: 'Thạc sĩ Y học - ĐH Y Hà Nội',
      description: 'Chuyên điều trị viêm tai, viêm xoang, polyp mũi'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Đội Ngũ Chuyên Gia
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm với nghề, luôn cập nhật kiến thức y học mới nhất để phục vụ bệnh nhân tốt nhất.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {doctors.map((doctor) => (
            <div 
              key={doctor.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 h-48 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{doctor.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold">{doctor.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{doctor.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    <span className="text-sm">{doctor.education}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{doctor.description}</p>
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Đặt lịch khám
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mt-12">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">50+</p>
              <p className="text-gray-600">Bác sĩ giỏi</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">30+</p>
              <p className="text-gray-600">Chuyên khoa</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">98%</p>
              <p className="text-gray-600">Hài lòng</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">24/7</p>
              <p className="text-gray-600">Hỗ trợ</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TeamSection
