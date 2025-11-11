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

  create: async (data: { name: string; specialtyId: number; phone: string }) => {
    const response = await fetch(`${API_URL}/doctors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create doctor')
    return response.json()
  },

  update: async (id: number, data: { name: string; specialtyId: number; phone: string }) => {
    const response = await fetch(`${API_URL}/doctors/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update doctor')
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

  create: async (data: { name: string; price: number; type: string }) => {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to create service')
    return response.json()
  },

  update: async (id: number, data: { name: string; price: number; type: string }) => {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to update service')
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
  }
}

export default {
  doctorApi,
  serviceApi,
  specialtyApi,
  workShiftApi,
  appointmentApi,
  patientApi
}
