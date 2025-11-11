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
    <section className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Bảng Giá Dịch Vụ
        </h2>

        <div className="max-w-6xl mx-auto overflow-hidden rounded-xl shadow-lg">
          <table className="w-full">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">
                  Dịch vụ
                </th>
                <th className="px-6 py-4 text-left text-gray-700 font-semibold">
                  Mô tả
                </th>
                <th className="px-6 py-4 text-right text-gray-700 font-semibold">
                  Giá (VNĐ)
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
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
