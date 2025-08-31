// Authentication API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, message: data.message || 'Login failed' }
    }

    return { success: true, token: data.token, user: data.user }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'Network error occurred' }
  }
}

export const signup = async (name, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, message: data.message || 'Signup failed' }
    }

    return { success: true, token: data.token, user: data.user }
  } catch (error) {
    console.error('Signup error:', error)
    return { success: false, message: 'Network error occurred' }
  }
}

export const logout = async () => {
  try {
    // Clear local storage
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    
    // Optional: Call logout endpoint if you have one
    const token = localStorage.getItem('authToken')
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    }
    
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    // Clear storage even if API call fails
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    return { success: true }
  }
}

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
}

export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
  return null
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}

// Helper to add auth headers to requests
export const getAuthHeaders = () => {
  const token = getAuthToken()
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}