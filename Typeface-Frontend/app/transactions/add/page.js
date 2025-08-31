'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TransactionForm from '../../../components/forms/TransactionForm'
import { useAuth } from '../../../hooks/useAuth'
import { addTransaction } from '../../../lib/api'

export default function AddTransaction() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const result = await addTransaction(formData)

      if (result.success) {
        router.push('/transactions')
      } else {
        setError(result.message || 'Failed to add transaction')
      }
    } catch (err) {
      setError('An error occurred while adding the transaction')
      console.error('Transaction error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout user={user}>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                Dashboard
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <Link href="/transactions" className="text-gray-500 hover:text-gray-700">
                Transactions
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-900">Add Transaction</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Add New Transaction</h1>
          <p className="text-gray-600">Record a new income or expense transaction</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Transaction Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
            <p className="text-sm text-gray-600">Fill in the details below to record your transaction</p>
          </div>

          <div className="p-6">
            <TransactionForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              submitLabel="Add Transaction"
            />
          </div>
        </div>

        {/* Quick Templates */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => {
                // Fill form with grocery template
                const event = new CustomEvent('fillTemplate', {
                  detail: {
                    transactionType: 'expense',
                    category: 'Groceries',
                    paymentMode: 'card'
                  }
                })
                window.dispatchEvent(event)
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className="bg-orange-100 p-2 rounded-full">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 9H6L5 9z" />
                  </svg>
                </div>
                <span className="ml-2 font-medium text-gray-900">Groceries</span>
              </div>
              <p className="text-sm text-gray-500">Quick expense entry for grocery shopping</p>
            </button>

            <button
              onClick={() => {
                const event = new CustomEvent('fillTemplate', {
                  detail: {
                    transactionType: 'expense',
                    category: 'Transportation',
                    paymentMode: 'upi'
                  }
                })
                window.dispatchEvent(event)
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <span className="ml-2 font-medium text-gray-900">Transportation</span>
              </div>
              <p className="text-sm text-gray-500">Travel expenses, fuel, parking</p>
            </button>

            <button
              onClick={() => {
                const event = new CustomEvent('fillTemplate', {
                  detail: {
                    transactionType: 'income',
                    category: 'Salary',
                    paymentMode: 'netbanking'
                  }
                })
                window.dispatchEvent(event)
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <span className="ml-2 font-medium text-gray-900">Salary</span>
              </div>
              <p className="text-sm text-gray-500">Monthly salary or income</p>
            </button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}