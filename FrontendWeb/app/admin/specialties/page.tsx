'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface Specialty {
  specialtyId: number
  name: string
  description: string | null
}

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`${API_URL}/specialties`)
      const data = await response.json()
      setSpecialties(data)
    } catch (error) {
      console.error('Error fetching specialties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Vui lòng đăng nhập')
      return
    }

    try {
      const url = editingSpecialty 
        ? `${API_URL}/specialties/${editingSpecialty.specialtyId}`
        : `${API_URL}/specialties`
      
      const method = editingSpecialty ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Lỗi khi lưu chuyên khoa')
      }

      await fetchSpecialties()
      setShowModal(false)
      setFormData({ name: '', description: '' })
      setEditingSpecialty(null)
    } catch (error) {
      console.error('Error saving specialty:', error)
      alert('Có lỗi xảy ra')
    }
  }

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty)
    setFormData({
      name: specialty.name,
      description: specialty.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa chuyên khoa này?')) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Vui lòng đăng nhập')
      return
    }

    try {
      const response = await fetch(`${API_URL}/specialties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      await fetchSpecialties()
    } catch (error: any) {
      console.error('Error deleting specialty:', error)
      alert(error.message || 'Có lỗi xảy ra')
    }
  }

  const handleAddNew = () => {
    setEditingSpecialty(null)
    setFormData({ name: '', description: '' })
    setShowModal(true)
  }

  if (loading) {
    return <AdminLayout><div className="p-8">Đang tải...</div></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý Chuyên khoa</h1>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Thêm chuyên khoa
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên chuyên khoa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {specialties.map((specialty) => (
                <tr key={specialty.specialtyId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{specialty.specialtyId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{specialty.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{specialty.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(specialty)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(specialty.specialtyId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingSpecialty ? 'Sửa chuyên khoa' : 'Thêm chuyên khoa'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tên chuyên khoa *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingSpecialty(null)
                    setFormData({ name: '', description: '' })
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingSpecialty ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
