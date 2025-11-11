'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const Navigation: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()

  const guestMenuItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Giới thiệu', href: '/about' },
    { label: 'Dịch vụ y tế', href: '/services' },
    { label: 'Đội ngũ chuyên gia', href: '/doctors' },
    { label: 'Hướng dẫn khách hàng', href: '/guide' },
    { label: 'Tuyển dụng', href: '/careers' },
  ]

  const patientMenuItems = [
    { label: 'Trang chủ', href: '/patient' },
    { label: 'Đặt lịch khám', href: '/patient/booking' },
    { label: 'Lịch sử khám', href: '/patient/history' },
    { label: 'Dịch vụ y tế', href: '/services' },
    { label: 'Đội ngũ chuyên gia', href: '/doctors' },
  ]

  const menuItems = user?.role === 'Patient' ? patientMenuItems : guestMenuItems

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <ul className="flex items-center justify-center gap-8 py-4">
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => router.push(item.href)}
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
