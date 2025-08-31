import { getAuthHeaders } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Helper function to make authenticated API calls
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'API call failed')
    }

    return { success: true, data }
  } catch (error) {
    console.error('API call error:', error)
    return { success: false, message: error.message }
  }
}

// Transaction API calls
export const getTransactions = async (queryParams) => {
  
  const url = `/transactions${queryParams ? `?${queryParams}` : ''}`
  return await apiCall(url, { method: 'GET' })
}

export const addTransaction = async (transactionData) => {
  return await apiCall('/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  })
}

export const updateTransaction = async (id, transactionData) => {
  return await apiCall(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transactionData),
  })
}

export const deleteTransaction = async (id) => {
  return await apiCall(`/transactions/${id}`, { method: 'DELETE' })
}

export const getTransaction = async (id) => {
  return await apiCall(`/transactions/${id}`, { method: 'GET' })
}

// Receipt upload API calls
export const uploadReceipt = async (file) => {
  
  const formData = new FormData()
  formData.append('receipt', file.file)

  // Determine the endpoint based on file type
  const fileType = file.file.type.toLowerCase()
  let endpoint = '/receipts'
  
  if (fileType == 'image/png' || fileType == 'image/jpg') {
    endpoint = '/receipts/image'
  } else if (fileType === 'application/pdf') {
    endpoint = '/receipts/pdf'
  } else {
    throw new Error('Unsupported file type. Please upload an image or PDF file.')
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData
    })

    if (!response.ok) {
      let errorMessage = 'Receipt upload failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        errorMessage = `${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return { 
      success: true, 
      data,
      fileName: file.name // Include the file name in response
    }
  } catch (error) {
    console.error('Receipt upload error:', error)
    return { 
      success: false, 
      message: error.message,
      status: error.response?.status,
      fileName: file.name // Include the file name in error response
    }
  }
}

export const uploadTransactionHistory = async (file) => {
  const formData = new FormData()
  formData.append('receipt', file.file)

  try {
    const response = await fetch(`${API_BASE_URL}/receipts/history-pdf`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Transaction history upload failed')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Transaction history upload error:', error)
    return { success: false, message: error.message }
  }
}

// Analytics API calls
export const getTransactionStats = async () => {
  const url = `/analytics/summary`
  return await apiCall(url, { method: 'GET' })
}

export const getExpensesByCategory = async () => {
  const url = `/analytics/expenses-by-category`
  return await apiCall(url, { method: 'GET' })
}

export const getExpensesByDate = async () => {
  const url = `/analytics/expenses-by-date`
  return await apiCall(url, { method: 'GET' })
}

export const getIncomeVsExpenses = async () => {
  const url = `/analytics/monthly-summary`
  return await apiCall(url, { method: 'GET' })
}