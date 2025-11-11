import React from 'react'

const Navigation: React.FC = () => {
  const menuItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Giới thiệu', href: '/about' },
    { label: 'Dịch vụ y tế', href: '/services' },
    { label: 'Đội ngũ chuyên gia', href: '/doctors' },
    { label: 'Hướng dẫn khách hàng', href: '/guide' },
    { label: 'Tuyển dụng', href: '/careers' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <ul className="flex items-center justify-center gap-8 py-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
