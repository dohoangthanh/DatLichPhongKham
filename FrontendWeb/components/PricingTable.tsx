import React from 'react'

interface Service {
  name: string
  description: string
  price: string
}

const PricingTable: React.FC = () => {
  const services: Service[] = [
    {
      name: 'Khám tổng quát',
      description: 'Khám sức khỏe toàn diện',
      price: '200.000',
    },
    {
      name: 'Kiểm tra máu',
      description: 'Công thức máu đầy đủ',
      price: '150.000',
    },
    {
      name: 'Chụp X-quang',
      description: 'Chụp phim X-quang',
      price: '200.000',
    },
    {
      name: 'Siêu âm',
      description: 'Siêu âm tổng quát',
      price: '300.000',
    },
    {
      name: 'Xét nghiệm sinh hóa',
      description: 'Kiểm tra chỉ số sinh hóa',
      price: '250.000',
    },
    {
      name: 'Kiểm tra nhanh COVID',
      description: 'Kiểm tra nhanh COVID-19',
      price: '100.000',
    },
    {
      name: 'Đo huyết áp',
      description: 'Kiểm tra huyết áp',
      price: '50.000',
    },
    {
      name: 'Đo đường huyết',
      description: 'Đo mạch máu',
      price: '50.000',
    },
  ]

  return (
    <section className="bg-white py-12 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/30 via-orange-50/20 to-yellow-50/30 pointer-events-none"></div>
      <div className="max-w-screen-2xl mx-auto px-6 relative z-10">
        <div className="text-center mb-10 animate-fadeIn">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
            Bảng Giá Dịch Vụ
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 mx-auto rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto overflow-hidden rounded-2xl shadow-2xl animate-slideUp">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100">
              <tr>
                <th className="px-6 py-5 text-left text-gray-800 font-bold text-lg">
                  Dịch vụ
                </th>
                <th className="px-6 py-5 text-left text-gray-800 font-bold text-lg">
                  Mô tả
                </th>
                <th className="px-6 py-5 text-right text-gray-800 font-bold text-lg">
                  Giá (VNĐ)
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } hover:bg-blue-50 transition`}
                >
                  <td className="px-6 py-4 text-gray-800">{service.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {service.description}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-800 font-semibold">
                    {service.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default PricingTable
