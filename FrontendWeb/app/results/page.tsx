'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { patientApi } from '@/services/patientApi'

interface MedicalRecord {
  recordId: number
  appointmentId: number
  symptoms: string
  diagnosis: string
  treatment: string
  notes: string
  createdDate: string
  appointment?: {
    appointmentId: number
    appointmentDate: string
    doctor?: {
      fullName: string
    }
    service?: {
      serviceName: string
    }
  }
}

interface LabResult {
  resultId: number
  recordId: number
  testName: string
  testType: string
  resultValue: string
  normalRange: string
  resultDate: string
  interpretation: string
  notes: string
}

export default function ResultsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [labResults, setLabResults] = useState<LabResult[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    } else if (user) {
      fetchMedicalRecords()
    }
  }, [user, loading, router])

  const fetchMedicalRecords = async () => {
    try {
      setLoadingData(true)
      const data = await patientApi.medicalRecords.getMyRecords()
      setRecords(data)
    } catch (error) {
      console.error('Error fetching medical records:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const fetchLabResults = async (recordId: number) => {
    try {
      const data = await patientApi.labResults.getByRecord(recordId)
      setLabResults(data)
    } catch (error) {
      console.error('Error fetching lab results:', error)
      setLabResults([])
    }
  }

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record)
    fetchLabResults(record.recordId)
  }

  const filteredRecords = records.filter(record => {
    const query = searchQuery.toLowerCase()
    return (
      record.diagnosis?.toLowerCase().includes(query) ||
      record.symptoms?.toLowerCase().includes(query) ||
      record.appointment?.doctor?.fullName.toLowerCase().includes(query)
    )
  })

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <main>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Kết Quả Khám Bệnh & Xét Nghiệm
            </h1>
            <p className="text-lg text-gray-700">
              Xem lại lịch sử khám bệnh và kết quả xét nghiệm của bạn
            </p>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-10 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 via-transparent to-indigo-50/20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm theo chẩn đoán, triệu chứng, bác sĩ..."
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
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Records List */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Lịch Sử Khám Bệnh</h2>
              {loadingData ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="bg-white rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">Chưa có hồ sơ khám bệnh nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map(record => (
                    <div
                      key={record.recordId}
                      onClick={() => handleViewDetails(record)}
                      className={`bg-white rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                        selectedRecord?.recordId === record.recordId ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {new Date(record.createdDate).toLocaleDateString('vi-VN')}
                        </span>
                        {selectedRecord?.recordId === record.recordId && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1">{record.diagnosis || 'Chưa có chẩn đoán'}</h3>
                      {record.appointment?.doctor && (
                        <p className="text-sm text-gray-600">BS. {record.appointment.doctor.fullName}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Record Details */}
            <div className="lg:col-span-2">
              {selectedRecord ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Chi Tiết Hồ Sơ</h2>
                  
                  {/* Medical Record Info */}
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{selectedRecord.diagnosis}</h3>
                        <p className="text-gray-600 mt-1">
                          Ngày khám: {new Date(selectedRecord.createdDate).toLocaleDateString('vi-VN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        In hồ sơ
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bác sĩ khám</label>
                        <p className="text-gray-900">
                          {selectedRecord.appointment?.doctor ? 
                            `BS. ${selectedRecord.appointment.doctor.fullName}` : 
                            'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ</label>
                        <p className="text-gray-900">
                          {selectedRecord.appointment?.service?.serviceName || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Triệu chứng</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded">
                        {selectedRecord.symptoms || 'Không có thông tin'}
                      </p>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chẩn đoán</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded">
                        {selectedRecord.diagnosis || 'Không có thông tin'}
                      </p>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Điều trị</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded">
                        {selectedRecord.treatment || 'Không có thông tin'}
                      </p>
                    </div>

                    {selectedRecord.notes && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedRecord.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Lab Results */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Kết Quả Xét Nghiệm</h3>
                    {labResults.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Không có kết quả xét nghiệm
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {labResults.map(result => (
                          <div key={result.resultId} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-gray-800">{result.testName}</h4>
                                <p className="text-sm text-gray-600">{result.testType}</p>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(result.resultDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <span className="text-sm text-gray-600">Kết quả:</span>
                                <p className="font-semibold text-gray-900">{result.resultValue}</p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Chỉ số bình thường:</span>
                                <p className="font-semibold text-gray-900">{result.normalRange}</p>
                              </div>
                            </div>

                            {result.interpretation && (
                              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <span className="text-sm font-medium text-blue-900">Nhận xét:</span>
                                <p className="text-sm text-blue-800 mt-1">{result.interpretation}</p>
                              </div>
                            )}

                            {result.notes && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Ghi chú:</span> {result.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">Chọn một hồ sơ để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
