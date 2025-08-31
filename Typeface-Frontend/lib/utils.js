// Utility functions for the Personal Finance Assistant

// Format currency with Indian formatting
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format date in various formats
export const formatDate = (date, format = 'short') => {
  const dateObj = new Date(date)
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    case 'long':
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    case 'time':
      return dateObj.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    case 'relative':
      return getRelativeTime(dateObj)
    default:
      return dateObj.toLocaleDateString('en-IN')
  }
}

// Get relative time (e.g., "2 days ago", "just now")
export const getRelativeTime = (date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`
  
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''} ago`
}

// Generate random colors for charts
export const generateColors = (count) => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
    '#F43F5E', '#06B6D4', '#8B5A2B', '#6B7280', '#DC2626'
  ]
  
  if (count <= colors.length) {
    return colors.slice(0, count)
  }
  
  // Generate additional colors if needed
  const additionalColors = []
  for (let i = colors.length; i < count; i++) {
    const hue = (i * 137.508) % 360 // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 50%)`)
  }
  
  return [...colors, ...additionalColors]
}

// Calculate transaction statistics
export const calculateTransactionStats = (transactions) => {
  const income = transactions
    .filter(t => t.transactionType === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const expenses = transactions
    .filter(t => t.transactionType === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  return {
    totalIncome: income,
    totalExpenses: expenses,
    netBalance: income - expenses,
    totalTransactions: transactions.length,
    averageIncome: income / Math.max(transactions.filter(t => t.transactionType === 'income').length, 1),
    averageExpense: expenses / Math.max(transactions.filter(t => t.transactionType === 'expense').length, 1)
  }
}

// Group transactions by period (day, week, month)
export const groupTransactionsByPeriod = (transactions, period = 'month') => {
  const groups = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date)
    let key
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        key = String(date.getFullYear())
        break
      default:
        key = date.toISOString().split('T')[0]
    }
    
    if (!groups[key]) {
      groups[key] = {
        period: key,
        transactions: [],
        income: 0,
        expenses: 0,
        count: 0
      }
    }
    
    groups[key].transactions.push(transaction)
    groups[key].count++
    
    if (transaction.transactionType === 'income') {
      groups[key].income += transaction.amount
    } else {
      groups[key].expenses += transaction.amount
    }
  })
  
  return Object.values(groups).sort((a, b) => a.period.localeCompare(b.period))
}

// Get category breakdown
export const getCategoryBreakdown = (transactions, type = 'all') => {
  const filteredTransactions = type === 'all' 
    ? transactions 
    : transactions.filter(t => t.transactionType === type)
  
  const categories = {}
  
  filteredTransactions.forEach(transaction => {
    const category = transaction.category || 'Uncategorized'
    if (!categories[category]) {
      categories[category] = {
        name: category,
        amount: 0,
        count: 0,
        transactions: []
      }
    }
    
    categories[category].amount += transaction.amount
    categories[category].count++
    categories[category].transactions.push(transaction)
  })
  
  return Object.values(categories).sort((a, b) => b.amount - a.amount)
}

// Validate transaction data
export const validateTransaction = (transactionData) => {
  const errors = {}
  
  if (!transactionData.amount || transactionData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0'
  }
  
  if (!transactionData.transactionType || !['income', 'expense'].includes(transactionData.transactionType)) {
    errors.transactionType = 'Invalid transaction type'
  }
  
  if (!transactionData.paymentMode || !['cash', 'card', 'upi', 'netbanking'].includes(transactionData.paymentMode)) {
    errors.paymentMode = 'Invalid payment mode'
  }
  
  if (!transactionData.category || transactionData.category.trim() === '') {
    errors.category = 'Category is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Export data to CSV
export const exportToCSV = (transactions, filename = 'transactions.csv') => {
  if (transactions.length === 0) return
  
  const headers = [
    'Date',
    'Type',
    'Amount',
    'Category',
    'Merchant',
    'Payment Mode',
    'Notes'
  ]
  
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      formatDate(t.date, 'short'),
      t.transactionType,
      t.amount,
      t.category || '',
      t.merchant || '',
      t.paymentMode,
      (t.notes || '').replace(/,/g, ';') // Replace commas to avoid CSV issues
    ].join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Class names utility (similar to clsx)
export const cn = (...classes) => {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim()
}