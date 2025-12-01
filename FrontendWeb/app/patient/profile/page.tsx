'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChatbotBubble from '@/components/ChatbotBubble'
import { patientProfileApi, authApi } from '@/services/patientApi'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

export default function ProfilePage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()

  const [profileData, setProfileData] = useState({
    name: '',
    dob: '',
    gender: 'Nam',
    phone: '',
    address: ''
  })

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(true)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Patient')) {
      router.replace('/login')
      return
    }
  }, [user, loading, router])

  const fetchPatientProfile = async () => {
    try {
      setIsLoadingProfile(true)
      console.log('Fetching profile for user:', user)
      const data = await patientProfileApi.getProfile()
      console.log('Profile data received:', data)
      setProfileData({
        name: data.name || '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        gender: data.gender || 'Nam',
        phone: data.phone || '',
        address: data.address || ''
      })
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      console.error('Error details:', error.message, error.status)
      alert('Không thể tải thông tin. Vui lòng thử lại.')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    if (token && user?.role === 'Patient' && user.patientId) {
      fetchPatientProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.patientId])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSavingProfile(true)
      await patientProfileApi.updateProfile(profileData)
      alert('Cập nhật thông tin thành công!')
    } catch (error: any) {
      alert(error.message || 'Lỗi khi cập nhật thông tin!')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!')
      return
    }

    try {
      setIsChangingPassword(true)
      await authApi.changePassword(passwordData.oldPassword, passwordData.newPassword)
      alert('Đổi mật khẩu thành công!')
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      alert(error.message || 'Lỗi khi đổi mật khẩu!')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'Patient') {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Quản lý tài khoản cá nhân
          </h1>
          <p className="text-gray-600 mb-8">Cập nhật thông tin và quản lý tài khoản của bạn</p>

          <div className="space-y-4">
            {/* Personal Information Dropdown */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-full p-5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-xl hover:from-blue-50 hover:to-blue-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h2>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isProfileOpen && (
                <form onSubmit={handleProfileSubmit} className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={profileData.dob}
                        onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Giới tính
                      </label>
                      <div className="relative">
                        <select
                          value={profileData.gender}
                          onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer pr-8"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              )}
            </div>

            {/* Change Password Dropdown */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
              <button
                type="button"
                onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                className="w-full p-5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-purple-50 rounded-t-xl hover:from-purple-50 hover:to-purple-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-800">Thay đổi mật khẩu</h2>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isPasswordOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isPasswordOpen && (
                <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mật khẩu cũ
                    </label>
                    <input
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full px-4 py-2.5 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? 'Đang thay đổi...' : 'Thay đổi mật khẩu'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <ChatbotBubble />
    </main>
  )
}
