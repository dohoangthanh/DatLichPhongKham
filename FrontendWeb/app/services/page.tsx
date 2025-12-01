'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { patientApi } from '@/services/patientApi'

interface Service {
  serviceId: number
  name: string
  price: number
  type?: string
  imageUrl?: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const data = await patientApi.services.getAll()
      console.log('Services page - Services data:', data)
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'kham-benh-tong-quat', name: 'Khám tổng quát' },
    { id: 'kham-chuyen-khoa', name: 'Chuyên khoa' },
    { id: 'xet-nghiem', name: 'Xét nghiệm' },
    { id: 'can-lam-sang', name: 'Cận lâm sàng' },
    { id: 'tiem-chung', name: 'Tiêm chủng' },
    { id: 'thu-thuat-nho', name: 'Thủ thuật nhỏ' },
    { id: 'phau-thuat', name: 'Phẫu thuật' },
    { id: 'vat-ly-tri-lieu', name: 'Vật Lý Trị Liệu' }
  ]

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => {
        const type = s.type?.toLowerCase() || ''
        if (selectedCategory === 'kham-benh-tong-quat') return type.includes('khám bệnh tổng quát')
        if (selectedCategory === 'kham-chuyen-khoa') return type.includes('khám chuyên khoa')
        if (selectedCategory === 'xet-nghiem') return type.includes('xét nghiệm')
        if (selectedCategory === 'can-lam-sang') return type.includes('cận lâm sàng')
        if (selectedCategory === 'tiem-chung') return type.includes('tiêm chủng')
        if (selectedCategory === 'thu-thuat-nho') return type.includes('thủ thuật nhỏ')
        if (selectedCategory === 'phau-thuat') return type.includes('phẫu thuật')
        if (selectedCategory === 'vat-ly-tri-lieu') return type.includes('vật lý trị liệu')
        return true
      })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <main>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/30 to-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">
              Dịch Vụ Khám Chữa Bệnh
            </h1>
            <p className="text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Chúng tôi cung cấp đa dạng các dịch vụ y tế chất lượng cao với đội ngũ bác sĩ chuyên môn giỏi
            </p>
          </div>

          {/* Filter Section */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải dịch vụ...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600">Không tìm thấy dịch vụ nào</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map(service => (
                <div key={service.serviceId} className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-cyan-200">
                  {/* Image Section - 2/3 of card */}
                  <div className="relative w-full h-48 bg-gradient-to-br from-cyan-50 to-blue-100 flex items-center justify-center overflow-hidden">
                    {service.imageUrl ? (
                      <>
                        <img 
                          src={service.imageUrl.startsWith('http') ? service.imageUrl : `http://localhost:5129${service.imageUrl}`}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<svg class="w-16 h-16 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </>
                    ) : (
                      <svg className="w-16 h-16 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                  </div>

                  {/* Info Section - 1/3 of card */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-800 flex-1 group-hover:text-cyan-600 transition-colors">
                        {service.name}
                      </h3>
                      <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent ml-2">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                    
                    {service.type && (
                      <p className="text-gray-600 mb-4">
                        <span className="bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
                          {service.type}
                        </span>
                      </p>
                    )}
                    
                    <a 
                      href="/patient/booking" 
                      className="block w-full text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Đặt lịch ngay
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-8">
            Tại Sao Chọn Chúng Tôi?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Chất Lượng Đảm Bảo</h3>
              <p className="text-gray-600">Đội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Giá Cả Hợp Lý</h3>
              <p className="text-gray-600">Chi phí minh bạch, nhiều chương trình ưu đãi</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Tiết Kiệm Thời Gian</h3>
              <p className="text-gray-600">Đặt lịch online, không phải chờ đợi</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
