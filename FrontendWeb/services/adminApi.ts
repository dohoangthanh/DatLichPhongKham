const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

// Doctor API
export const doctorApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/doctors`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch doctors')
    return response.json()
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_URL}/doctors/${id}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch doctor')
    return response.json()
  },

  create: async (data: { name: string; specialtyId: number; phone: string; imageUrl?: string }) => {
    const response = await fetch(`${API_URL}/doctors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create doctor')
    return response.json()
  },

  update: async (id: number, data: { name: string; specialtyId: number; phone: string; imageUrl?: string }) => {
    const response = await fetch(`${API_URL}/doctors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update doctor')
    return response.json()
  },

  uploadImage: async (file: File) => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_URL}/doctors/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    })
    if (!response.ok) throw new Error('Failed to upload image')
    return response.json()
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/doctors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete doctor')
    return response.ok
  }
}

// Service API
export const serviceApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/services`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch services')
    return response.json()
  },

  create: async (data: { name: string; price: number; type: string; imageUrl?: string }) => {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Service create error:', response.status, errorText)
      throw new Error(`Failed to create service: ${response.status}`)
    }
    return response.json()
  },

  update: async (id: number, data: { name: string; price: number; type: string; imageUrl?: string }) => {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Service update error:', response.status, errorText)
      throw new Error(`Failed to update service: ${response.status}`)
    }
    // PUT usually returns 204 No Content
    if (response.status === 204) {
      return { success: true }
    }
    return response.json()
  },

  uploadImage: async (file: File) => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_URL}/services/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Service image upload error:', response.status, errorText)
      throw new Error(`Failed to upload image: ${response.status}`)
    }
    return response.json()
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete service')
    return response.ok
  }
}

// Stats API
export const statsApi = {
  // Lấy thống kê doanh thu
  getRevenue: async (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    
    const response = await fetch(`${API_URL}/stats/revenue?${params.toString()}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Revenue API error:', response.status, errorText)
      throw new Error(`Failed to fetch revenue stats: ${response.status} ${errorText}`)
    }
    return response.json()
  },

  // Lấy danh sách bệnh nhân khám nhiều nhất
  getTopPatients: async (limit: number = 10, from?: string, to?: string) => {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    
    const response = await fetch(`${API_URL}/stats/top-patients?${params.toString()}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Top patients API error:', response.status, errorText)
      throw new Error(`Failed to fetch top patients: ${response.status} ${errorText}`)
    }
    return response.json()
  },

  // Lấy thống kê tổng quan dashboard
  getDashboard: async () => {
    const response = await fetch(`${API_URL}/stats/dashboard`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Dashboard API error:', response.status, errorText)
      throw new Error(`Failed to fetch dashboard stats: ${response.status} ${errorText}`)
    }
    return response.json()
  },

  // Thống kê lịch hẹn theo trạng thái
  getAppointmentsByStatus: async (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    
    const response = await fetch(`${API_URL}/stats/appointments/by-status?${params.toString()}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Appointments by status API error:', response.status, errorText)
      throw new Error(`Failed to fetch appointment stats by status: ${response.status} ${errorText}`)
    }
    return response.json()
  },

  // Thống kê theo chuyên khoa
  getAppointmentsBySpecialty: async (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.append('from', from)
    if (to) params.append('to', to)
    
    const response = await fetch(`${API_URL}/stats/appointments/by-specialty?${params.toString()}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Appointments by specialty API error:', response.status, errorText)
      throw new Error(`Failed to fetch appointment stats by specialty: ${response.status} ${errorText}`)
    }
    return response.json()
  }
}

// Specialty API
export const specialtyApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/specialties`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch specialties')
    return response.json()
  },

  create: async (data: { name: string }) => {
    const response = await fetch(`${API_URL}/specialties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create specialty')
    return response.json()
  }
}

// WorkShift API
export const workShiftApi = {
  getByDoctorId: async (doctorId: number) => {
    const response = await fetch(`${API_URL}/schedule/workshift/${doctorId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch work shifts')
    return response.json()
  },

  create: async (data: { doctorId: number; date: string; startTime: string; endTime: string }) => {
    const response = await fetch(`${API_URL}/schedule/workshift`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create work shift')
    return response.json()
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/schedule/workshift/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete work shift')
    return response.ok
  }
}

// Appointment API
export const appointmentApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/appointments`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch appointments')
    return response.json()
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_URL}/appointments/${id}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch appointment')
    return response.json()
  },

  create: async (data: any) => {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create appointment')
    return response.json()
  },

  updateStatus: async (id: number, status: string) => {
    const response = await fetch(`${API_URL}/appointments/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    })
    if (!response.ok) throw new Error('Failed to update appointment status')
    return response.json()
  }
}

// Patient API
export const patientApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/patients`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch patients')
    return response.json()
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch patient')
    return response.json()
  },

  create: async (data: { name: string; dob: string; gender: string; phone: string; address: string }) => {
    const response = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create patient')
    return response.json()
  },

  update: async (id: number, data: { name: string; dob: string; gender: string; phone: string; address: string }) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update patient')
    return response.json()
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete patient')
    return response.ok
  }
}

// User Management API (Admin only)
export const userManagementApi = {
  // Doctor with account management
  getDoctorsWithAccounts: async () => {
    const response = await fetch(`${API_URL}/admin/usermanagement/doctors`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch doctors with accounts')
    return response.json()
  },

  getDoctorWithAccount: async (id: number) => {
    const response = await fetch(`${API_URL}/admin/usermanagement/doctors/${id}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch doctor with account')
    return response.json()
  },

  createDoctorWithAccount: async (data: {
    name: string
    specialtyId: number
    phone: string
    username: string
    password: string
    imageUrl?: string
  }) => {
    const response = await fetch(`${API_URL}/admin/usermanagement/doctors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create doctor with account')
    }
    return response.json()
  },

  updateDoctor: async (id: number, data: { name: string; specialtyId: number; phone: string; imageUrl?: string }) => {
    const response = await fetch(`${API_URL}/admin/usermanagement/doctors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update doctor')
    return response.ok
  },

  uploadDoctorImage: async (file: File) => {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${API_URL}/doctors/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    })
    if (!response.ok) throw new Error('Failed to upload image')
    return response.json()
  },

  deleteDoctor: async (id: number) => {
    const response = await fetch(`${API_URL}/admin/usermanagement/doctors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete doctor')
    return response.ok
  },

  // Patient with account management
  getPatientsWithAccounts: async () => {
    const response = await fetch(`${API_URL}/admin/usermanagement/patients`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch patients with accounts')
    return response.json()
  },

  getPatientWithAccount: async (id: number) => {
    const response = await fetch(`${API_URL}/admin/usermanagement/patients/${id}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch patient with account')
    return response.json()
  },

  createPatientWithAccount: async (data: {
    name: string
    dob: string
    gender: string
    phone: string
    address: string
    username: string
    password: string
  }) => {
    const response = await fetch(`${API_URL}/admin/usermanagement/patients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create patient with account')
    }
    return response.json()
  },

  updatePatient: async (id: number, data: { 
    name: string
    dob: string
    gender: string
    phone: string
    address: string
  }) => {
    const response = await fetch(`${API_URL}/admin/usermanagement/patients/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update patient')
    return response.ok
  },

  deletePatient: async (id: number) => {
    const response = await fetch(`${API_URL}/admin/usermanagement/patients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete patient')
    return response.ok
  },

  // User account management
  updateUserAccount: async (userId: number, data: {
    username?: string
    password?: string
    role?: string
  }) => {
    const response = await fetch(`${API_URL}/admin/usermanagement/accounts/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update user account')
    }
    return response.ok
  },

  resetPassword: async (userId: number, newPassword: string) => {
    const response = await fetch(`${API_URL}/admin/usermanagement/accounts/${userId}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newPassword)
    })
    if (!response.ok) throw new Error('Failed to reset password')
    return response.json()
  }
}

// Feedback API
export const feedbackApi = {
  getAll: async (page: number = 1, pageSize: number = 10) => {
    const response = await fetch(`${API_URL}/feedback?page=${page}&pageSize=${pageSize}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch feedback')
    return response.json()
  },

  reply: async (id: number, replyText: string) => {
    const response = await fetch(`${API_URL}/feedback/reply/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ replyText })
    })
    if (!response.ok) throw new Error('Failed to reply to feedback')
    return response.json()
  }
}

// Promotion API
export const promotionApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/promotions`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch promotions')
    return response.json()
  },

  getActive: async () => {
    const response = await fetch(`${API_URL}/promotions/active`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch active promotions')
    return response.json()
  },

  create: async (data: { description: string; discountPercent: number; startDate: string; endDate: string }) => {
    const response = await fetch(`${API_URL}/promotions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create promotion')
    return response.json()
  },

  update: async (id: number, data: { description?: string; discountPercent?: number; startDate?: string; endDate?: string }) => {
    const response = await fetch(`${API_URL}/promotions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update promotion')
    return response.json()
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_URL}/promotions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete promotion')
    return response.ok
  }
}

// Loyalty Points API
export const loyaltyPointsApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/loyaltypoints`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch loyalty points')
    return response.json()
  },

  getByPatient: async (patientId: number) => {
    const response = await fetch(`${API_URL}/loyaltypoints/patient/${patientId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch patient loyalty points')
    return response.json()
  },

  addPoints: async (patientId: number, points: number) => {
    const response = await fetch(`${API_URL}/loyaltypoints/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ patientId, points })
    })
    if (!response.ok) throw new Error('Failed to add points')
    return response.json()
  },

  updatePoints: async (patientId: number, points: number) => {
    const response = await fetch(`${API_URL}/loyaltypoints/update/${patientId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ points })
    })
    if (!response.ok) throw new Error('Failed to update points')
    return response.json()
  }
}

export default {
  doctorApi,
  serviceApi,
  specialtyApi,
  workShiftApi,
  appointmentApi,
  patientApi,
  userManagementApi,
  feedbackApi,
  promotionApi,
  loyaltyPointsApi
}
