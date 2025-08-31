'use client'

import { useState, useEffect } from 'react'

const categories = {
  income: [
    'Salary', 'Freelance', 'Investment Returns', 'Business Income', 
    'Rental Income', 'Side Hustle', 'Bonus', 'Gift', 'Other Income'
  ],
  expense: [
    'Food & Dining', 'Groceries', 'Transportation', 'Shopping', 
    'Entertainment', 'Bills & Utilities', 'Healthcare', 'Education',
    'Travel', 'Insurance', 'Investment', 'Rent', 'Home Maintenance',
    'Personal Care', 'Subscriptions', 'Other'
  ]
}

const paymentModes = ['cash', 'card', 'upi', 'netbanking']

export default function TransactionForm({ 
  onSubmit, 
  isSubmitting = false, 
  submitLabel = 'Save Transaction',
  initialData = null 
}) {
  const [formData, setFormData] = useState({
    transactionType: 'expense',
    amount: '',
    currency: 'INR',
    merchant: '',
    category: '',
    notes: '',
    paymentMode: 'card',
    date: new Date().toISOString().split('T')[0]
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: initialData.date 
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      })
    }
  }, [initialData])

  // Listen for template fill events
  useEffect(() => {
    const handleFillTemplate = (event) => {
      setFormData(prev => ({
        ...prev,
        ...event.detail
      }))
    }

    window.addEventListener('fillTemplate', handleFillTemplate)
    return () => window.removeEventListener('fillTemplate', handleFillTemplate)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Reset category when transaction type changes
    if (name === 'transactionType') {
      setFormData(prev => ({
        ...prev,
        category: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    if (!formData.paymentMode) {
      newErrors.paymentMode = 'Please select a payment mode'
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date'
    }

    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Convert form data to API format
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date).toISOString()
    }

    onSubmit(transactionData)
  }

  const availableCategories = categories[formData.transactionType] || []

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Transaction Type */}
      <div className="form-group">
        <label className="form-label">Transaction Type *</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="transactionType"
              value="income"
              checked={formData.transactionType === 'income'}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Income</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="transactionType"
              value="expense"
              checked={formData.transactionType === 'expense'}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Expense</span>
          </label>
        </div>
        {errors.transactionType && (
          <p className="text-red-500 text-sm mt-1">{errors.transactionType}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount */}
        <div className="form-group">
          <label htmlFor="amount" className="form-label">Amount *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              className={`form-input pl-7 ${errors.amount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Date */}
        <div className="form-group">
          <label htmlFor="date" className="form-label">Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`form-input ${errors.date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-input ${errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          >
            <option value="">Select a category</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
          )}
        </div>

        {/* Payment Mode */}
        <div className="form-group">
          <label htmlFor="paymentMode" className="form-label">Payment Mode *</label>
          <select
            id="paymentMode"
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            className={`form-input ${errors.paymentMode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          >
            {paymentModes.map(mode => (
              <option key={mode} value={mode}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </option>
            ))}
          </select>
          {errors.paymentMode && (
            <p className="text-red-500 text-sm mt-1">{errors.paymentMode}</p>
          )}
        </div>
      </div>

      {/* Merchant */}
      <div className="form-group">
        <label htmlFor="merchant" className="form-label">Merchant/Description</label>
        <input
          type="text"
          id="merchant"
          name="merchant"
          value={formData.merchant}
          onChange={handleChange}
          placeholder="Where was this transaction made?"
          className="form-input"
        />
      </div>

      {/* Notes */}
      <div className="form-group">
        <label htmlFor="notes" className="form-label">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Additional notes about this transaction..."
          className="form-input"
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">* Required fields</p>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </div>
    </form>
  )
}