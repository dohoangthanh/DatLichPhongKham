'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { serviceApi } from '@/services/adminApi'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

interface Service {
  serviceId: number
  name: string
  price: number
  type: string
  imageUrl?: string
}

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const itemsPerPage = 10

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    type: '',
    imageUrl: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const serviceTypes = [
    'Khám bệnh tổng quát',
    'Khám chuyên khoa',
    'Xét nghiệm',
    'Cận lâm sàng',
    'Tiêm chủng',
    'Thủ thuật nhỏ',
    'Phẫu thuật',
    'Vật lý trị liệu'
  ]

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Services data:', data)
        setServices(data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let imageUrl = formData.imageUrl

      // Upload image if a new file is selected
      if (imageFile) {
        console.log('Uploading service image...')
        const uploadResult = await serviceApi.uploadImage(imageFile)
        console.log('Service upload result:', uploadResult)
        imageUrl = uploadResult.imageUrl
      }

      const serviceData = {
        name: formData.name,
        price: formData.price,
        type: formData.type,
        imageUrl: imageUrl
      }

      console.log('Service data to save:', serviceData)

      if (editingService) {
        await serviceApi.update(editingService.serviceId, serviceData)
        alert('Cập nhật dịch vụ thành công!')
      } else {
        await serviceApi.create(serviceData)
        alert('Thêm dịch vụ thành công!')
      }

      setShowModal(false)
      setFormData({ name: '', price: 0, type: '', imageUrl: '' })
      setImageFile(null)
      setImagePreview('')
      setEditingService(null)
      fetchServices()
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Có lỗi xảy ra!')
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      price: service.price,
      type: service.type,
      imageUrl: service.imageUrl || ''
    })
    setImagePreview(service.imageUrl || '')
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchServices()
        alert('Xóa dịch vụ thành công!')
      } else {
        alert('Có lỗi xảy ra!')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Có lỗi xảy ra!')
    }
  }

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentServices = filteredServices.slice(startIndex, endIndex)

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Khám bệnh tổng quát': 'bg-blue-100 text-blue-800',
      'Khám chuyên khoa': 'bg-indigo-100 text-indigo-800',
      'Xét nghiệm': 'bg-green-100 text-green-800',
      'Cận lâm sàng': 'bg-purple-100 text-purple-800',
      'Tiêm chủng': 'bg-yellow-100 text-yellow-800',
      'Thủ thuật nhỏ': 'bg-orange-100 text-orange-800',
      'Phẫu thuật': 'bg-red-100 text-red-800',
      'Vật lý trị liệu': 'bg-pink-100 text-pink-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Dịch vụ</h1>
          <button
            onClick={() => {
              setEditingService(null)
              setFormData({ name: '', price: 0, type: '', imageUrl: '' })
              setImageFile(null)
              setImagePreview('')
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm mới Dịch vụ
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã DV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên Dịch Vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đơn Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại Dịch Vụ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentServices.map((service) => (
                <tr key={service.serviceId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.type === 'Khám bệnh tổng quát' ? 'KBTQ' : 
                     service.type === 'Khám chuyên khoa' ? 'KCK' : 
                     service.type === 'Xét nghiệm' ? 'XN' : 
                     service.type === 'Cận lâm sàng' ? 'CLS' : 
                     service.type === 'Tiêm chủng' ? 'TC' : 
                     service.type === 'Thủ thuật nhỏ' ? 'TTN' : 
                     service.type === 'Phẫu thuật' ? 'PT' : 
                     service.type === 'Vật lý trị liệu' ? 'VLTL' : 'DV'}-{String(service.serviceId).padStart(3, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.price.toLocaleString('vi-VN')} VND
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(service.type)}`}>
                      {service.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(service.serviceId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Hiển thị {startIndex + 1} đến {Math.min(endIndex, filteredServices.length)} trên {filteredServices.length} kết quả
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingService ? 'Cập nhật Dịch vụ' : 'Thêm mới Dịch vụ'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Dịch Vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên dịch vụ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ảnh Dịch Vụ
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImageFile(file)
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-blue-200">
                      <img 
                        src={imagePreview.startsWith('http') || imagePreview.startsWith('data:') ? imagePreview : `http://localhost:5129${imagePreview}`}
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại Dịch Vụ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn loại dịch vụ --</option>
                  {serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn Giá (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập đơn giá"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingService(null)
                    setFormData({ name: '', price: 0, type: '', imageUrl: '' })
                    setImageFile(null)
                    setImagePreview('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingService ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default ServicesPage
