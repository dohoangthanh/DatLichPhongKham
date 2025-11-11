import React from 'react'

const CTAButtons: React.FC = () => {
  const buttons = [
    {
      text: 'Đặt lịch khám',
      color: 'bg-blue-500 hover:bg-blue-600',
      href: '/booking',
    },
    {
      text: 'Tra cứu kết quả',
      color: 'bg-green-500 hover:bg-green-600',
      href: '/results',
    },
    {
      text: 'Bảng giá dịch vụ',
      color: 'bg-cyan-400 hover:bg-cyan-500',
      href: '/pricing',
    },
  ]

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {buttons.map((button, index) => (
            <a
              key={index}
              href={button.href}
              className={`${button.color} text-white text-xl font-semibold py-6 px-8 rounded-xl text-center shadow-lg transition transform hover:scale-105 hover:shadow-xl`}
            >
              {button.text}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CTAButtons
