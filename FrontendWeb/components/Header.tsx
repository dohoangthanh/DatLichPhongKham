'use client'

import React from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      logout()
      router.push('/')
    }
  }

  const guestMenuItems = [
     { label: 'TRANG CHỦ', href: '/' },
    { label: 'GIỚI THIỆU', href: '/about' },
    { label: 'DỊCH VỤ', href: '/services' },
    { label: 'ĐỘI NGŨ CHUYÊN GIA', href: '/doctors' },
    { label: 'QUY TRÌNH KHÁM BỆNH', href: '/guide' },
    { label: 'ĐẶT CHỖ CỦA TÔI', href: '/login' },
  ]

  const patientMenuItems = [
    { label: 'TRANG CHỦ', href: '/patient' },
    { label: 'ĐẶT LỊCH KHÁM', href: '/patient/booking' },
    { label: 'LỊCH SỬ KHÁM', href: '/patient/history' },
    { label: 'DỊCH VỤ Y TẾ', href: '/services' },
    { label: 'ĐỘI NGŨ CHUYÊN GIA', href: '/doctors' },
  ]

  const menuItems = user?.role === 'Patient' ? patientMenuItems : guestMenuItems

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(user ? (user.role === 'Patient' ? '/patient' : '/') : '/')}>
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Logo Phòng Khám"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 flex justify-center">
            <ul className="flex items-center gap-1">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => router.push(item.href)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors uppercase tracking-wide"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Section: Phone & User */}
          <div className="flex items-center gap-6">
            {/* Phone */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-lg font-semibold text-blue-600">1900 565656</span>
            </div>

            {/* Search Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* User Section */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Xin chào,</p>
                  <p className="text-sm font-semibold text-gray-800">{user.username}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/register')}
                  className="px-4 py-2 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50 transition-colors"
                >
                  Đăng ký
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
