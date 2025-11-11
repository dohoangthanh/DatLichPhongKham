'use client'

import React from 'react'
import DoctorLayout from '@/components/DoctorLayout'

export default function DoctorMedicalRecordsPage() {
  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bệnh án</h1>
          <p className="text-gray-600">Quản lý hồ sơ bệnh án điện tử</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chức năng đang phát triển</h3>
            <p className="text-gray-600">
              Tính năng quản lý bệnh án sẽ sớm được bổ sung trong các phiên bản tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}
