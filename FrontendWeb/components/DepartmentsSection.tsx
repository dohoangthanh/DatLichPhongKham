import React from 'react'
import Image from 'next/image'

const DepartmentsSection: React.FC = () => {
  const departments = [
    {
      icon: '🔬',
      imagePath: '/images/departments/khoa-noi.png',
      title: 'Khoa Nội',
      description: 'Khám và điều trị các bệnh nội khoa.',
      imageNote: 'VỊ TRÍ 2: Icon kính hiển vi hoặc biểu tượng khoa nội',
    },
    {
      icon: '⚕️',
      imagePath: '/images/departments/khoa-ngoai.png',
      title: 'Khoa Ngoại',
      description: 'Phẫu thuật và điều trị các bệnh ngoại khoa.',
      imageNote: 'VỊ TRÍ 3: Icon caduceus (biểu tượng y khoa) màu xanh',
    },
    {
      icon: '👶',
      imagePath: '/images/departments/khoa-san.png',
      title: 'Khoa Sản',
      description: 'Chăm sóc sức khỏe phụ nữ và trẻ em.',
      imageNote: 'VỊ TRÍ 4: Icon em bé màu vàng',
    },
  ]

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {departments.map((dept, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-xl transition"
            >
              {/* Icon các khoa */}
              <div className="relative w-40 h-40 mx-auto mb-6">
                <Image
                  src={dept.imagePath}
                  alt={dept.title}
                  fill
                  className="object-contain"
                />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {dept.title}
              </h3>
              <p className="text-gray-600">{dept.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DepartmentsSection
