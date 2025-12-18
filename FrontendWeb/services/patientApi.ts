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

// Payment API
export const paymentApi = {
  create: async (data: {
    appointmentId: number
    totalAmount: number
    paymentMethod: string
    promoCode?: string
  }) => {
    try {
      console.log('Calling payment API:', `${API_URL}/payment/create`, data)
      const response = await fetch(`${API_URL}/payment/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      
      console.log('Payment API response status:', response.status)
      
      if (!response.ok) {
        let errorMessage = 'Failed to create payment'
        try {
          const error = await response.json()
          errorMessage = error.message || error.Message || errorMessage
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      console.log('Payment API success:', result)
      return result
    } catch (error: any) {
      console.error('Payment API error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
      }
      throw error
    }
  },
  
  getStatus: async (paymentId: number) => {
    const response = await fetch(`${API_URL}/payment/${paymentId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch payment status')
    return response.json()
  },
  
  getInvoice: async (appointmentId: number) => {
    const response = await fetch(`${API_URL}/payment/invoice/${appointmentId}`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch invoice')
    return response.json()
  },

  markAsTransferred: async (paymentId: number) => {
    const response = await fetch(`${API_URL}/payment/mark-transferred/${paymentId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to mark payment as transferred')
    }
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
  loyaltyPoints: loyaltyPointsApi,
  payment: paymentApi
}

export default {
  patientMedicalApi,
  patientProfileApi,
  authApi,
  loyaltyPointsApi,
  promotionApi,
  patientApi
}
