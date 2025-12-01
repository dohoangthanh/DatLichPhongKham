'use client'

import { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

export default function BackupRestorePage() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleBackup = async () => {
    setIsBackingUp(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/backup/create`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        // Thử parse error message từ JSON response
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || 'Backup thất bại')
        }
        throw new Error(`Backup thất bại (HTTP ${response.status})`)
      }

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Tạo tên file với giờ Việt Nam (UTC+7)
      const now = new Date()
      const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000))
      const year = vietnamTime.getUTCFullYear()
      const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0')
      const day = String(vietnamTime.getUTCDate()).padStart(2, '0')
      const hours = String(vietnamTime.getUTCHours()).padStart(2, '0')
      const minutes = String(vietnamTime.getUTCMinutes()).padStart(2, '0')
      const seconds = String(vietnamTime.getUTCSeconds()).padStart(2, '0')
      
      const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`
      const filename = `QuanLyKhamBenh_Backup_${timestamp}.bak`
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage({ type: 'success', text: 'Backup thành công! File đã được tải về.' })
    } catch (error: any) {
      console.error('Error backing up:', error)
      setMessage({ type: 'error', text: error.message || 'Backup thất bại. Vui lòng thử lại.' })
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setMessage(null)
    }
  }

  const handleRestore = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file backup' })
      return
    }

    setIsRestoring(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('backupFile', selectedFile)

      const response = await fetch(`${API_URL}/backup/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Restore thất bại')
      }

      setMessage({ type: 'success', text: 'Restore thành công! Database đã được khôi phục.' })
      setSelectedFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('restore-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error: any) {
      console.error('Error restoring:', error)
      setMessage({ type: 'error', text: error.message || 'Restore thất bại. Vui lòng thử lại.' })
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Backup & Restore Database</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {/* Backup Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Backup Database</h2>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> File backup sẽ tự động đặt tên theo định dạng: 
                <code className="bg-blue-100 px-2 py-1 rounded ml-1">QuanLyKhamBenh_Backup_YYYYMMDD_HHMMSS.bak</code>
              </p>
            </div>

            <button
              onClick={handleBackup}
              disabled={isBackingUp}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isBackingUp ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang backup...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Tạo Backup & Tải xuống
                </>
              )}
            </button>
          </div>

          {/* Restore Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Restore Database</h2>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-800">
                <strong>⚠️ Cảnh báo:</strong> Restore sẽ ghi đè toàn bộ dữ liệu hiện tại. 
                Hãy đảm bảo bạn đã backup dữ liệu trước khi thực hiện!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn file backup (.bak)
                </label>
                <input
                  id="restore-file"
                  type="file"
                  accept=".bak"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    File đã chọn: <span className="font-medium">{selectedFile.name}</span>
                  </p>
                )}
              </div>

              <button
                onClick={handleRestore}
                disabled={isRestoring || !selectedFile}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isRestoring ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang restore...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Restore Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Hướng dẫn sử dụng</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-2">1.</span>
              <span><strong>Backup:</strong> Nhấn nút "Tạo Backup & Tải xuống" để tạo file backup. File sẽ tự động tải về máy của bạn.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">2.</span>
              <span><strong>Restore:</strong> Chọn file backup (.bak) từ máy tính, sau đó nhấn "Restore Database" để khôi phục dữ liệu.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-2">3.</span>
              <span><strong>Lưu ý:</strong> Nên thực hiện backup định kỳ để bảo vệ dữ liệu. Restore sẽ ghi đè dữ liệu hiện tại.</span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}
