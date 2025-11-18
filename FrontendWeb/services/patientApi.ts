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

export default {
  patientMedicalApi,
  patientProfileApi,
  authApi
}
