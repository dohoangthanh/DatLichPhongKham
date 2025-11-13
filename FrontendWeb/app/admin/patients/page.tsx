'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { userManagementApi } from '@/services/adminApi'

interface UserAccount {
  userId: number
  username: string
  role: string
}

interface Patient {
  patientId: number
  name: string
  dob: string
  gender: string
  phone: string
  address: string
  userAccount: UserAccount | null
}

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const itemsPerPage = 10

  const [formData, setFormData] = useState({
    name: '', dob: '', gender: 'Nam', phone: '', address: '', username: '', password: ''
  })

  const [accountFormData, setAccountFormData] = useState({ username: '', password: '' })

  useEffect(() => { fetchPatients() }, [])

  const fetchPatients = async () => {
    try {
      const data = await userManagementApi.getPatientsWithAccounts()
      setPatients(data)
    } catch (error) {
      console.error('Error fetching patients:', error)
      alert('Lỗi khi tải danh sách bệnh nhân!')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingPatient) {
        await userManagementApi.updatePatient(editingPatient.patientId, {
          name: formData.name, dob: formData.dob, gender: formData.gender,
          phone: formData.phone, address: formData.address
        })
        alert('Cập nhật bệnh nhân thành công!')
      } else {
        if (!formData.username || !formData.password) {
          alert('Vui lòng nhập username và password!')
          return
        }
        await userManagementApi.createPatientWithAccount(formData)
        alert('Thêm bệnh nhân thành công!')
      }
      setShowModal(false)
      setFormData({ name: '', dob: '', gender: 'Nam', phone: '', address: '', username: '', password: '' })
      setEditingPatient(null)
      fetchPatients()
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra!')
    }
  }

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    setFormData({ ...patient, username: '', password: '' })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa bệnh nhân này? Tài khoản liên kết cũng sẽ bị xóa.')) return
    try {
      await userManagementApi.deletePatient(id)
      fetchPatients()
      alert('Xóa bệnh nhân thành công!')
    } catch (error) {
      alert('Có lỗi xảy ra!')
    }
  }

  const handleManageAccount = (patient: Patient) => {
    setSelectedPatient(patient)
    setAccountFormData({
      username: patient.userAccount?.username || '',
      password: ''
    })
    setShowAccountModal(true)
  }

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient?.userAccount) return
    try {
      await userManagementApi.updateUserAccount(selectedPatient.userAccount.userId, {
        username: accountFormData.username,
        password: accountFormData.password || undefined
      })
      alert('Cập nhật tài khoản thành công!')
      setShowAccountModal(false)
      setSelectedPatient(null)
      fetchPatients()
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra!')
    }
  }

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm)
  )

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý Bệnh nhân</h1>
          <button
            onClick={() => {
              setEditingPatient(null)
              setFormData({ name: '', dob: '', gender: 'Nam', phone: '', address: '', username: '', password: '' })
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Thêm mới
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã BN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Sinh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giới Tính</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài Khoản</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPatients.map((p) => (
                <tr key={p.patientId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">BN{String(p.patientId).padStart(4, '0')}</td>
                  <td className="px-6 py-4 text-sm">{p.name}</td>
                  <td className="px-6 py-4 text-sm">{p.dob}</td>
                  <td className="px-6 py-4 text-sm">{p.gender}</td>
                  <td className="px-6 py-4 text-sm">{p.phone}</td>
                  <td className="px-6 py-4 text-sm">
                    {p.userAccount ? (
                      <div><span className="font-medium">{p.userAccount.username}</span></div>
                    ) : <span className="text-red-500">Chưa có TK</span>}
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-900">Sửa</button>
                    {p.userAccount && (
                      <button onClick={() => handleManageAccount(p)} className="text-green-600 hover:text-green-900">Quản lý TK</button>
                    )}
                    <button onClick={() => handleDelete(p.patientId)} className="text-red-600 hover:text-red-900">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-gray-50 px-4 py-3 flex justify-between border-t">
            <div className="text-sm text-gray-700">
              Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredPatients.length)} / {filteredPatients.length}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingPatient ? 'Cập nhật' : 'Thêm mới'} Bệnh nhân</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngày Sinh <span className="text-red-500">*</span></label>
                <input type="date" required value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giới Tính <span className="text-red-500">*</span></label>
                <select required value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SĐT <span className="text-red-500">*</span></label>
                <input type="tel" required value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa Chỉ <span className="text-red-500">*</span></label>
                <textarea required value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" rows={3} />
              </div>
              {!editingPatient && (
                <>
                  <div className="border-t pt-4"><h3 className="text-sm font-semibold mb-2">Thông tin tài khoản</h3></div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Username <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password <span className="text-red-500">*</span></label>
                    <input type="password" required value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingPatient(null) }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">
                  {editingPatient ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAccountModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Quản lý TK - {selectedPatient.name}</h2>
            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username <span className="text-red-500">*</span></label>
                <input type="text" required value={accountFormData.username}
                  onChange={(e) => setAccountFormData({ ...accountFormData, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password (để trống nếu không đổi)</label>
                <input type="password" value={accountFormData.password}
                  onChange={(e) => setAccountFormData({ ...accountFormData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowAccountModal(false); setSelectedPatient(null) }}
                  className="flex-1 px-4 py-2 border rounded-lg">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default PatientsPage
