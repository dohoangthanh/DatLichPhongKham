'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { patientApi } from '@/services/patientApi'

interface Service {
  serviceId: number
  name: string
  price: number
  type: string
  imageUrl?: string
}

export default function PricingPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const data = await patientApi.services.getAll()
      console.log('Pricing page - Services data:', data)
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '📋' },
    { id: 'kham', name: 'Khám bệnh', icon: '🩺' },
    { id: 'xetnghiem', name: 'Xét nghiệm', icon: '🔬' },
    { id: 'chandoan', name: 'Chẩn đoán hình ảnh', icon: '📊' },
    { id: 'khac', name: 'Dịch vụ khác', icon: '⚕️' }
  ]

  const filteredServices = services.filter(service => {
    const query = searchQuery.toLowerCase()
    const name = service.name?.toLowerCase() || ''
    const type = service.type?.toLowerCase() || ''
    
    const matchesSearch = name.includes(query) || type.includes(query)
    
    if (selectedCategory === 'all') return matchesSearch
    
    let matchesCategory = false
    if (selectedCategory === 'kham') matchesCategory = type.includes('kham') || name.includes('khám')
    else if (selectedCategory === 'xetnghiem') matchesCategory = type.includes('lab') || name.includes('xét nghiệm')
    else if (selectedCategory === 'chandoan') matchesCategory = type.includes('imaging') || name.includes('chẩn đoán') || name.includes('x-quang') || name.includes('siêu âm')
    else matchesCategory = true
    
    return matchesSearch && matchesCategory
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <main>
      <Header />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              Bảng Giá Dịch Vụ
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Giá cả minh bạch, chất lượng dịch vụ tốt nhất
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-10 bg-white sticky top-0 z-10 shadow-md relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/20 via-transparent to-pink-50/20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Box */}
            <div className="w-full md:w-96">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm dịch vụ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg 
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải bảng giá...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600">Không tìm thấy dịch vụ phù hợp</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  Hiển thị <span className="font-semibold text-blue-600">{filteredServices.length}</span> dịch vụ
                </p>
              </div>

              {/* Table View for Desktop */}
              <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Dịch vụ</th>
                      <th className="px-6 py-4 text-left font-semibold">Mô tả</th>
                      <th className="px-6 py-4 text-left font-semibold">Chuyên khoa</th>
                      <th className="px-6 py-4 text-center font-semibold">Thời gian</th>
                      <th className="px-6 py-4 text-right font-semibold">Giá</th>
                      <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredServices.map((service, index) => (
                      <tr key={service.serviceId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center mr-3">
                              {service.imageUrl ? (
                                <img 
                                  src={service.imageUrl.startsWith('http') ? service.imageUrl : `http://localhost:5129${service.imageUrl}`}
                                  alt={service.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>';
                                  }}
                                />
                              ) : (
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              )}
                            </div>
                            <span className="font-medium text-gray-900">{service.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {service.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">
                          <span className="text-gray-400">-</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(service.price)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <a
                            href="/patient/booking"
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Đặt lịch
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card View for Mobile */}
              <div className="md:hidden space-y-4">
                {filteredServices.map(service => (
                  <div key={service.serviceId} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {service.imageUrl ? (
                          <img 
                            src={service.imageUrl.startsWith('http') ? service.imageUrl : `http://localhost:5129${service.imageUrl}`}
                            alt={service.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<span class="text-2xl">🔌</span>';
                            }}
                          />
                        ) : (
                          <span className="text-2xl">🔌</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {service.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          {formatPrice(service.price)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        Loại dịch vụ: <span className="font-medium">{service.type}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Mã DV: #{service.serviceId}
                      </span>
                      <a
                        href="/patient/booking"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Đặt lịch
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Giá Cả Minh Bạch</h3>
              <p className="text-gray-600">Bảng giá rõ ràng, không phát sinh chi phí</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Nhiều Hình Thức Thanh Toán</h3>
              <p className="text-gray-600">Tiền mặt, thẻ ATM, chuyển khoản, ví điện tử</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Chương Trình Ưu Đãi</h3>
              <p className="text-gray-600">Khuyến mãi định kỳ, tích điểm đổi quà</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Cần Tư Vấn Về Dịch Vụ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Liên hệ hotline <span className="font-bold">1900 565 656</span> để được tư vấn miễn phí
          </p>
          <a
            href="/patient/booking"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Đặt Lịch Khám Ngay
          </a>
        </div>
      </section>

      <Footer />
    </main>
  )
}
