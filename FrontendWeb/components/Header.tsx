'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search function with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const performSearch = async (query: string) => {
    setIsSearching(true)
    try {
      const lowerQuery = query.toLowerCase().trim()
      
      // Fetch all doctors and services
      const [doctorsRes, servicesRes] = await Promise.all([
        fetch(`${API_URL}/doctors`),
        fetch(`${API_URL}/services`)
      ])

      const allDoctors = doctorsRes.ok ? await doctorsRes.json() : []
      const allServices = servicesRes.ok ? await servicesRes.json() : []

      // Filter doctors by name or specialty
      const doctors = allDoctors.filter((d: any) => 
        d.name?.toLowerCase().includes(lowerQuery) ||
        d.specialty?.name?.toLowerCase().includes(lowerQuery)
      )

      // Filter services by name or description
      const services = allServices.filter((s: any) => 
        s.name?.toLowerCase().includes(lowerQuery) ||
        s.description?.toLowerCase().includes(lowerQuery)
      )

      const results = [
        ...doctors.slice(0, 5).map((d: any) => ({ type: 'doctor', data: d })),
        ...services.slice(0, 5).map((s: any) => ({ type: 'service', data: s }))
      ]

      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchClick = (result: any) => {
    if (result.type === 'doctor') {
      router.push(`/doctors`)
    } else if (result.type === 'service') {
      router.push(`/services`)
    }
    setShowSearch(false)
    setSearchQuery('')
  }

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
            <div className="relative" ref={searchRef}>
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Search Dropdown */}
              {showSearch && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm bác sĩ, dịch vụ..."
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Search Results */}
                    <div className="mt-3 max-h-96 overflow-y-auto">
                      {isSearching ? (
                        <div className="text-center py-4 text-gray-500">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2">Đang tìm kiếm...</p>
                        </div>
                      ) : searchQuery.trim().length < 2 ? (
                        <div className="text-center py-4 text-gray-500">
                          <p>Nhập ít nhất 2 ký tự để tìm kiếm</p>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                          <p>Không tìm thấy kết quả nào</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {searchResults.map((result, index) => (
                            <div
                              key={index}
                              onClick={() => handleSearchClick(result)}
                              className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100"
                            >
                              {result.type === 'doctor' ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">BS. {result.data.name}</p>
                                    <p className="text-sm text-gray-600">{result.data.specialty?.name || 'Bác sĩ'}</p>
                                  </div>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Bác sĩ</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{result.data.name}</p>
                                    <p className="text-sm text-blue-600 font-semibold">
                                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.data.price || 0)}
                                    </p>
                                  </div>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Dịch vụ</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

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
