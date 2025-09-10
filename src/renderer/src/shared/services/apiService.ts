// API Service that works in both Electron and Browser

const API_BASE_URL = 'http://localhost:3001/api'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
  message?: string
}

class ApiService {
  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async validateToken(token: string) {
    return this.request('/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }

  async requestPasswordReset(email: string) {
    return this.request('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  async validatePasswordResetToken(token: string) {
    return this.request('/auth/validate-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    })
  }

  // Health check
  async health() {
    return this.request('/health')
  }
}

export const apiService = new ApiService()