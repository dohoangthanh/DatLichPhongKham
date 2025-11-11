'use client'

import React from 'react'
import DoctorLayout from '@/components/DoctorLayout'

export default function DoctorPatientsPage() {
  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bệnh nhân</h1>
          <p className="text-gray-600">Quản lý danh sách bệnh nhân</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chức năng đang phát triển</h3>
            <p className="text-gray-600">
              Tính năng quản lý bệnh nhân sẽ sớm được bổ sung trong các phiên bản tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}
