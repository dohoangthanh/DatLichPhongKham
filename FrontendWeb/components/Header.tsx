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
    <header className="bg-white relative">
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-transparent to-cyan-50/30 pointer-events-none"></div>
      <div className="max-w-screen-2xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer transform hover:scale-105 transition-all duration-300" onClick={() => router.push(user ? (user.role === 'Patient' ? '/patient' : '/') : '/')}>
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Logo Phòng Khám"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">PHÒNG</h1>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">KHÁM ĐA</h1>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">KHOA</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded text-white hover:from-cyan-600 hover:to-blue-600 transition-all duration-300">
                🔍
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-8">
            <div>
              <p className="text-sm text-gray-600">Đường dây nóng</p>
              <p className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">1900565656</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Liên hệ</p>
              <p className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Hỗ trợ khách hàng</p>
            </div>
          </div>

          {/* Auth Buttons or User Info */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Xin chào,</p>
                <p className="font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{user.username}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/register')}
                className="px-6 py-2 border-2 border-cyan-500 text-cyan-600 rounded-lg hover:bg-cyan-50 transition-all duration-300 transform hover:scale-105"
              >
                Đăng ký
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30"
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
