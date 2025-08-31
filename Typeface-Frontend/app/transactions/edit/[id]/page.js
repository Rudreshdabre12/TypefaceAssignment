'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import TransactionForm from '../../../../components/forms/TransactionForm'
import { useAuth } from '../../../../hooks/useAuth'
import { getTransaction, updateTransaction } from '../../../../lib/api'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function EditTransaction() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!params.id) return

      try {
        setLoading(true)
        const result = await getTransaction(params.id)

        if (result.success) {
          setTransaction(result.data)
        } else {
          setError(result.message || 'Failed to fetch transaction')
          // Redirect back if transaction not found
          setTimeout(() => router.push('/transactions'), 2000)
        }
      } catch (err) {
        setError('An error occurred while fetching the transaction')
        console.error('Fetch transaction error:', err)
        setTimeout(() => router.push('/transactions'), 2000)
      } finally {
        setLoading(false)
      }
    }

    if (user && params.id) {
      fetchTransaction()
    }
  }, [user, params.id, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const handleSubmit = async (formData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const result = await updateTransaction(params.id, formData)
      if (result.success) {
        // Show success message briefly then redirect
        router.push('/transactions?updated=true')
      } else {
        setError(result.message || 'Failed to update transaction')
      }
    } catch (err) {
      setError('An error occurred while updating the transaction')
      console.error('Update transaction error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return
    }

    try {
      setIsSubmitting(true)
      const { deleteTransaction } = await import('../../../../lib/api')
      const result = await deleteTransaction(params.id)

      if (result.success) {
        router.push('/transactions?deleted=true')
      } else {
        setError(result.message || 'Failed to delete transaction')
      }
    } catch (err) {
      setError('An error occurred while deleting the transaction')
      console.error('Delete transaction error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error && !transaction) {
    return (
      <DashboardLayout>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-sm text-red-600 mt-2">Redirecting to transactions page...</p>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    )
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
              <span className="text-gray-900">Edit Transaction</span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Transaction</h1>
            <p className="text-gray-600">Update the details of your transaction</p>
            {transaction && (
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Created: {new Date(transaction.createdAt).toLocaleDateString('en-IN')}</span>
                {transaction.updatedAt !== transaction.createdAt && (
                  <span>Last updated: {new Date(transaction.updatedAt).toLocaleDateString('en-IN')}</span>
                )}
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
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
        {transaction && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
                  <p className="text-sm text-gray-600">Update the information below to modify your transaction</p>
                </div>

                {/* Transaction Type Badge */}
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.transactionType === 'income'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  <svg className={`w-3 h-3 mr-1 ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                    }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d={transaction.transactionType === 'income'
                      ? "M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                      : "M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                    } clipRule="evenodd" />
                  </svg>
                  {transaction.transactionType === 'income' ? 'Income' : 'Expense'}
                </div>
              </div>
            </div>

            <div className="p-6">
              <TransactionForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel="Update Transaction"
                initialData={transaction}
              />
            </div>
          </div>
        )}

        {/* Transaction History */}
        {transaction && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Transaction Created</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Initial transaction for ₹{transaction.amount.toLocaleString()} in {transaction.category}
                  </p>
                </div>
              </div>

              {transaction.updatedAt !== transaction.createdAt && (
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">Transaction Updated</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.updatedAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">Transaction details were modified</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Currently Editing</p>
                    <p className="text-sm text-gray-500">Now</p>
                  </div>
                  <p className="text-sm text-gray-600">Making changes to this transaction</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/transactions"
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ← Back to Transactions
          </Link>
        </div>
      </main>
    </DashboardLayout>
  )
}