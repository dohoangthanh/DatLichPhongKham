'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { userManagementApi, specialtyApi } from '@/services/adminApi'

interface Specialty {
  specialtyId: number
  name: string
}

interface UserAccount {
  userId: number
  username: string
  role: string
  doctorId?: number
  patientId?: number
}

interface Doctor {
  doctorId: number
  name: string
  phone: string
  specialty: Specialty | null
  userAccount: UserAccount | null
}

const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  const itemsPerPage = 10

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialtyId: 0,
    username: '',
    password: ''
  })

  const [accountFormData, setAccountFormData] = useState({
    username: '',
    password: ''
  })

  useEffect(() => {
    fetchDoctors()
    fetchSpecialties()
  }, [])

  const fetchDoctors = async () => {
    try {
      const data = await userManagementApi.getDoctorsWithAccounts()
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      alert('Lỗi khi tải danh sách bác sĩ!')
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const data = await specialtyApi.getAll()
      setSpecialties(data)
    } catch (error) {
      console.error('Error fetching specialties:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone || formData.specialtyId === 0) {
      alert('Vui lòng điền đầy đủ thông tin!')
      return
    }

    try {
      if (editingDoctor) {
        // Update existing doctor
        await userManagementApi.updateDoctor(editingDoctor.doctorId, {
          name: formData.name,
          phone: formData.phone,
          specialtyId: formData.specialtyId
        })
        alert('Cập nhật bác sĩ thành công!')
      } else {
        // Create new doctor with account
        if (!formData.username || !formData.password) {
          alert('Vui lòng nhập username và password!')
          return
        }
        
        await userManagementApi.createDoctorWithAccount({
          name: formData.name,
          phone: formData.phone,
          specialtyId: formData.specialtyId,
          username: formData.username,
          password: formData.password
        })
        alert('Thêm bác sĩ thành công!')
      }
      
      setShowModal(false)
      setFormData({ name: '', phone: '', specialtyId: 0, username: '', password: '' })
      setEditingDoctor(null)
      fetchDoctors()
    } catch (error: any) {
      console.error('Error saving doctor:', error)
      alert(error.message || 'Có lỗi xảy ra!')
    }
  }

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setFormData({
      name: doctor.name,
      phone: doctor.phone,
      specialtyId: doctor.specialty?.specialtyId || 0,
      username: '',
      password: ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bác sĩ này? Tài khoản liên kết cũng sẽ bị xóa.')) return

    try {
      await userManagementApi.deleteDoctor(id)
      fetchDoctors()
      alert('Xóa bác sĩ thành công!')
    } catch (error) {
      console.error('Error deleting doctor:', error)
      alert('Có lỗi xảy ra!')
    }
  }

  const handleManageAccount = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    if (doctor.userAccount) {
      setAccountFormData({
        username: doctor.userAccount.username,
        password: ''
      })
    } else {
      setAccountFormData({
        username: '',
        password: ''
      })
    }
    setShowAccountModal(true)
  }

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedDoctor?.userAccount) {
      alert('Bác sĩ này chưa có tài khoản!')
      return
    }

    if (!accountFormData.username) {
      alert('Vui lòng nhập username!')
      return
    }

    try {
      await userManagementApi.updateUserAccount(selectedDoctor.userAccount.userId, {
        username: accountFormData.username,
        password: accountFormData.password || undefined
      })
      
      alert('Cập nhật tài khoản thành công!')
      setShowAccountModal(false)
      setAccountFormData({ username: '', password: '' })
      setSelectedDoctor(null)
      fetchDoctors()
    } catch (error: any) {
      console.error('Error updating account:', error)
      alert(error.message || 'Có lỗi xảy ra!')
    }
  }

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('Nhập mật khẩu mới:')
    if (!newPassword) return

    try {
      await userManagementApi.resetPassword(userId, newPassword)
      alert('Đặt lại mật khẩu thành công!')
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Có lỗi xảy ra!')
    }
  }

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.phone.includes(searchTerm) ||
    doctor.specialty?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex)

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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bác sĩ</h1>
          <button
            onClick={() => {
              setEditingDoctor(null)
              setFormData({ name: '', phone: '', specialtyId: 0, username: '', password: '' })
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm mới Bác sĩ
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã bác sĩ..."
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
                  Mã Bác Sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Họ và Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chuyên Khoa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số Điện Thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài Khoản
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDoctors.map((doctor) => (
                <tr key={doctor.doctorId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    BS{String(doctor.doctorId).padStart(3, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.specialty?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doctor.userAccount ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{doctor.userAccount.username}</span>
                        <span className="text-xs text-gray-500">ID: {doctor.userAccount.userId}</span>
                      </div>
                    ) : (
                      <span className="text-red-500">Chưa có tài khoản</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(doctor)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Sửa
                    </button>
                    {doctor.userAccount && (
                      <button
                        onClick={() => handleManageAccount(doctor)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Quản lý TK
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doctor.doctorId)}
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
              Hiển thị {startIndex + 1} đến {Math.min(endIndex, filteredDoctors.length)} trên {filteredDoctors.length} kết quả
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

      {/* Modal Add/Edit Doctor */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingDoctor ? 'Cập nhật Bác sĩ' : 'Thêm mới Bác sĩ'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ và tên bác sĩ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên Khoa <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.specialtyId}
                  onChange={(e) => setFormData({ ...formData, specialtyId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>-- Chọn chuyên khoa --</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.specialtyId} value={specialty.specialtyId}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số Điện Thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {!editingDoctor && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Thông tin tài khoản</h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={!editingDoctor}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required={!editingDoctor}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập password"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingDoctor(null)
                    setFormData({ name: '', phone: '', specialtyId: 0, username: '', password: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingDoctor ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Manage Account */}
      {showAccountModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Quản lý Tài khoản - {selectedDoctor.name}
            </h2>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountFormData.username}
                  onChange={(e) => setAccountFormData({ ...accountFormData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password (để trống nếu không đổi)
                </label>
                <input
                  type="password"
                  value={accountFormData.password}
                  onChange={(e) => setAccountFormData({ ...accountFormData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập password mới"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountModal(false)
                    setSelectedDoctor(null)
                    setAccountFormData({ username: '', password: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default DoctorsPage
