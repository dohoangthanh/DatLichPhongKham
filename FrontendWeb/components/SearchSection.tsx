'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Specialty {
  id: number
  name: string
  description: string
}

interface Doctor {
  id: number
  name: string
  specialtyId: number
  experience: string
}

const SearchSection: React.FC = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  // Data mẫu seed cứng
  const specialties: Specialty[] = [
    { id: 1, name: 'Tim mạch', description: 'Chuyên khoa tim mạch' },
    { id: 2, name: 'Nhi khoa', description: 'Chuyên khoa nhi' },
    { id: 3, name: 'Da liễu', description: 'Chuyên khoa da liễu' },
    { id: 4, name: 'Tiêu hóa', description: 'Chuyên khoa tiêu hóa' },
    { id: 5, name: 'Sản phụ khoa', description: 'Chuyên khoa sản phụ' },
    { id: 6, name: 'Tai mũi họng', description: 'Chuyên khoa TMH' },
    { id: 7, name: 'Mắt', description: 'Chuyên khoa mắt' },
    { id: 8, name: 'Răng hàm mặt', description: 'Chuyên khoa răng hàm mặt' }
  ]

  const doctors: Doctor[] = [
    { id: 1, name: 'BS. Nguyễn Văn An', specialtyId: 1, experience: '20 năm' },
    { id: 2, name: 'BS. Trần Thị Bình', specialtyId: 2, experience: '15 năm' },
    { id: 3, name: 'BS. Lê Minh Châu', specialtyId: 3, experience: '12 năm' },
    { id: 4, name: 'BS. Phạm Hoàng Dũng', specialtyId: 4, experience: '18 năm' },
    { id: 5, name: 'BS. Võ Thị Em', specialtyId: 5, experience: '16 năm' },
    { id: 6, name: 'BS. Đỗ Văn Phúc', specialtyId: 6, experience: '14 năm' },
    { id: 7, name: 'BS. Hoàng Thị Giang', specialtyId: 7, experience: '13 năm' },
    { id: 8, name: 'BS. Phan Văn Hùng', specialtyId: 8, experience: '17 năm' }
  ]

  const handleSearch = () => {
    let results: any[] = []

    if (selectedSpecialty) {
      const specialty = specialties.find(s => s.id.toString() === selectedSpecialty)
      const specialtyDoctors = doctors.filter(d => d.specialtyId.toString() === selectedSpecialty)
      
      results = [{
        type: 'specialty',
        data: specialty,
        doctors: specialtyDoctors
      }]
    } else if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase()
      
      const matchingSpecialties = specialties.filter(s => 
        s.name.toLowerCase().includes(searchLower) || 
        s.description.toLowerCase().includes(searchLower)
      )
      
      const matchingDoctors = doctors.filter(d => 
        d.name.toLowerCase().includes(searchLower)
      )

      results = [
        ...matchingSpecialties.map(s => ({ type: 'specialty', data: s })),
        ...matchingDoctors.map(d => ({
          type: 'doctor',
          data: d,
          specialty: specialties.find(s => s.id === d.specialtyId)
        }))
      ]
    }

    setSearchResults(results)
  }

  const handleBooking = (doctorId?: number, specialtyId?: number) => {
    alert('Vui lòng đăng nhập để đặt lịch khám')
    router.push('/login')
  }

  return (
    <section className="py-10 bg-white">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-4">
            Tìm Kiếm Dịch Vụ
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Tìm kiếm chuyên khoa hoặc bác sĩ phù hợp với nhu cầu của bạn
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search Form */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl shadow-2xl p-8 mb-8 transform hover:scale-105 transition-all duration-300">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-white text-sm font-semibold mb-2">
                  Tìm kiếm theo tên chuyên khoa hoặc bác sĩ
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nhập tên chuyên khoa hoặc bác sĩ..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-purple-300 focus:ring-2 focus:ring-purple-300 outline-none transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Hoặc chọn chuyên khoa
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-transparent focus:border-purple-300 focus:ring-2 focus:ring-purple-300 outline-none transition-all duration-300"
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {specialties.map((specialty) => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSearch}
              className="mt-4 w-full md:w-auto px-8 py-3 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔍 Tìm kiếm
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 ? (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Kết quả tìm kiếm ({searchResults.length})
              </h3>
              
              {searchResults.map((result, index) => (
                <div 
                  key={index}
                  className="bg-white border-2 border-purple-100 rounded-lg p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:scale-105"
                >
                  {result.type === 'specialty' ? (
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-800">{result.data.name}</h4>
                              <p className="text-gray-600 text-sm">{result.data.description}</p>
                            </div>
                          </div>
                          
                          {result.doctors && result.doctors.length > 0 && (
                            <div className="mt-4 pl-15">
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                Bác sĩ chuyên khoa ({result.doctors.length}):
                              </p>
                              <div className="space-y-2">
                                {result.doctors.map((doctor: Doctor) => (
                                  <div key={doctor.id} className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg hover:shadow-md transition-all duration-300">
                                    <div>
                                      <p className="font-semibold text-gray-800">{doctor.name}</p>
                                      <p className="text-sm text-gray-600">{doctor.experience} kinh nghiệm</p>
                                    </div>
                                    <button
                                      onClick={() => handleBooking(doctor.id, result.data.id)}
                                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-sm transform hover:scale-105"
                                    >
                                      Đặt lịch
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {!result.doctors && (
                          <button
                            onClick={() => handleBooking(undefined, result.data.id)}
                            className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            Đặt lịch khám
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-800">{result.data.name}</h4>
                          <p className="text-blue-600 font-semibold">{result.specialty?.name}</p>
                          <p className="text-gray-600 text-sm">{result.data.experience} kinh nghiệm</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBooking(result.data.id, result.data.specialtyId)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Đặt lịch khám
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery || selectedSpecialty ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-600 text-lg">Không tìm thấy kết quả phù hợp</p>
              <p className="text-gray-500 text-sm mt-2">Vui lòng thử lại với từ khóa khác</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {specialties.slice(0, 6).map((specialty) => (
                <div
                  key={specialty.id}
                  className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => {
                    setSelectedSpecialty(specialty.id.toString())
                    setSearchResults([])
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{specialty.name}</h4>
                      <p className="text-gray-600 text-sm">{specialty.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default SearchSection
