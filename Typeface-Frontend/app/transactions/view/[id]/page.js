'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../../hooks/useAuth'
import { getTransaction, deleteTransaction } from '../../../../lib/api'
import { formatCurrency, formatDate } from '../../../../lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function ViewTransaction() {
    const router = useRouter()
    const params = useParams()
    const { user, loading: authLoading } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [transaction, setTransaction] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

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
                    setTimeout(() => router.push('/transactions'), 3000)
                }
            } catch (err) {
                setError('An error occurred while fetching the transaction')
                console.error('Fetch transaction error:', err)
                setTimeout(() => router.push('/transactions'), 3000)
            } finally {
                setLoading(false)
            }
        }

        if (user && params.id) {
            fetchTransaction()
        }
    }, [user, params.id, router])

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            return
        }

        try {
            setIsDeleting(true)
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
            setIsDeleting(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading transaction details...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    if (error && !transaction) {
        return (
            <DashboardLayout user={user}>
                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
                        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 className="text-lg font-medium text-red-800 mb-2">Transaction Not Found</h3>
                        <p className="text-red-700 mb-4">{error}</p>
                        <p className="text-red-600 text-sm">Redirecting to transactions page...</p>
                    </div>
                </main>
            </DashboardLayout>
        )
    }

    if (!transaction) return null

    const getPaymentModeIcon = (mode) => {
        switch (mode) {
            case 'cash':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                )
            case 'card':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                )
            case 'upi':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                )
            case 'netbanking':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                )
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                )
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
                            <span className="text-gray-900">Transaction Details</span>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-full ${transaction.transactionType === 'income' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                <svg className={`w-6 h-6 ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                                    }`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d={transaction.transactionType === 'income'
                                        ? "M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                                        : "M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                                    } clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {transaction.merchant || transaction.category || 'Transaction'}
                                </h1>
                                <p className={`text-3xl font-bold mt-1 ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {transaction.transactionType === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/transactions/edit/${transaction._id}`}
                            className="btn-primary flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>

                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isDeleting ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Deleting...
                                </div>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
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

                {/* Transaction Details */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Transaction Details</h2>

                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1">Type</dt>
                            <dd className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.transactionType === 'income'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {transaction.transactionType === 'income' ? 'Income' : 'Expense'}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1">Amount</dt>
                            <dd className={`text-lg font-bold ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {transaction.transactionType === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1">Category</dt>
                            <dd className="text-sm text-gray-900">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {transaction.category || 'Uncategorized'}
                                </span>
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1">Payment Mode</dt>
                            <dd className="flex items-center text-sm text-gray-900">
                                <div className="bg-blue-100 p-1 rounded mr-2">
                                    {getPaymentModeIcon(transaction.paymentMode)}
                                </div>
                                <span className="capitalize">{transaction.paymentMode}</span>
                            </dd>
                        </div>

                        {transaction.merchant && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500 mb-1">Merchant/Description</dt>
                                <dd className="text-sm text-gray-900">{transaction.merchant}</dd>
                            </div>
                        )}

                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1">Date & Time</dt>
                            <dd className="text-sm text-gray-900">
                                {formatDate(transaction.createdAt, 'long')} at{' '}
                                {new Date(transaction.createdAt).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1">Currency</dt>
                            <dd className="text-sm text-gray-900">{transaction.currency}</dd>
                        </div>

                        <div>
                            <dt className="text-sm font-medium text-gray-500 mb-1">Transaction ID</dt>
                            <dd className="text-sm font-mono text-gray-600 break-all">{transaction._id}</dd>
                        </div>
                    </dl>

                    {/* Notes Section - This is what you wanted! */}
                    {transaction.notes && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <dt className="text-sm font-medium text-gray-500 mb-3">Notes</dt>
                            <dd className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md border-l-4 border-blue-400">
                                <div className="whitespace-pre-wrap">{transaction.notes}</div>
                            </dd>
                        </div>
                    )}

                    {/* Additional Description/Details if they exist in your schema */}
                    {transaction.description && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <dt className="text-sm font-medium text-gray-500 mb-3">Description</dt>
                            <dd className="text-sm text-gray-900 bg-blue-50 p-4 rounded-md">
                                <div className="whitespace-pre-wrap">{transaction.description}</div>
                            </dd>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                    <Link
                        href="/transactions"
                        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Transactions
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link
                            href="/transactions/add"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                        >
                            Add New Transaction →
                        </Link>
                    </div>
                </div>
            </main>
        </DashboardLayout>
    )
}