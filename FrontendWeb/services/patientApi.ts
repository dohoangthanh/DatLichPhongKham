const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5129/api'

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
}

// Patient Medical Records API
export const patientMedicalApi = {
  getMyMedicalRecord: async (appointmentId: number) => {
    const response = await fetch(`${API_URL}/patient/my-records/${appointmentId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      if (response.status === 404) {
        const error = await response.json()
        throw new Error(error.message || 'Không tìm thấy kết quả khám')
      }
      throw new Error('Failed to fetch medical record')
    }
    return response.json()
  }
}

// Patient Profile API
export const patientProfileApi = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/patient/profile`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }
    return response.json()
  },
  
  updateProfile: async (data: {
    name?: string
    dob?: string
    gender?: string
    phone?: string
    address?: string
  }) => {
    const response = await fetch(`${API_URL}/patient/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update profile')
    }
    return response.json()
  }
}

// Auth API
export const authApi = {
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to change password')
    }
    return response.json()
  }
}

// Loyalty Points API
export const loyaltyPointsApi = {
  getMyPoints: async () => {
    const response = await fetch(`${API_URL}/loyaltypoints/my-points`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch loyalty points')
    return response.json()
  }
}

// Promotion API
export const promotionApi = {
  validatePromoCode: async (promoCode: string) => {
    const response = await fetch(`${API_URL}/promotions/validate/${promoCode}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Invalid promo code')
    }
    return response.json()
  }
}

// Specialties API
export const specialtiesApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/specialties`)
    if (!response.ok) throw new Error('Failed to fetch specialties')
    return response.json()
  }
}

// Doctors API
export const doctorsApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/doctors`)
    if (!response.ok) throw new Error('Failed to fetch doctors')
    return response.json()
  },
  getBySpecialty: async (specialtyId: number) => {
    const response = await fetch(`${API_URL}/doctors/specialty/${specialtyId}`)
    if (!response.ok) throw new Error('Failed to fetch doctors')
    return response.json()
  }
}

// Services API
export const servicesApi = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/services`)
    if (!response.ok) throw new Error('Failed to fetch services')
    return response.json()
  }
}

// Appointments API
export const appointmentsApi = {
  create: async (data: {
    doctorId: number
    serviceId: number
    appointmentDate: string
    notes?: string
  }) => {
    const response = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      const error = await response.json()
      throw error
    }
    return response.json()
  }
}

// Medical Records API
export const medicalRecordsApi = {
  getMyRecords: async () => {
    const response = await fetch(`${API_URL}/medicalrecords/my-records`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch medical records')
    return response.json()
  }
}

// Lab Results API
export const labResultsApi = {
  getByRecord: async (recordId: number) => {
    const response = await fetch(`${API_URL}/labresults/record/${recordId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch lab results')
    return response.json()
  }
}

export const patientApi = {
  specialties: specialtiesApi,
  doctors: doctorsApi,
  services: servicesApi,
  appointments: appointmentsApi,
  medicalRecords: medicalRecordsApi,
  labResults: labResultsApi,
  promotions: promotionApi,
  loyaltyPoints: loyaltyPointsApi
}

export default {
  patientMedicalApi,
  patientProfileApi,
  authApi,
  loyaltyPointsApi,
  promotionApi,
  patientApi
}
