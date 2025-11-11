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

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(user ? (user.role === 'Patient' ? '/patient' : '/') : '/')}>
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Logo Phòng Khám"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600">PHÒNG</h1>
              <h1 className="text-xl font-bold text-blue-600">KHÁM ĐA</h1>
              <h1 className="text-xl font-bold text-blue-600">KHOA</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-100 rounded">
                🔍
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-gray-600">Đường dây nóng</p>
              <p className="text-lg font-semibold text-blue-600">1900565656</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Liên hệ</p>
              <p className="text-lg font-semibold text-blue-400">Hỗ trợ khách hàng</p>
            </div>
          </div>

          {/* Auth Buttons or User Info */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Xin chào,</p>
                <p className="font-semibold text-blue-600">{user.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-2 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition"
              >
                Đăng ký
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
