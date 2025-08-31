'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TransactionList from './TransactionList'
import { useAuth } from '../../hooks/useAuth'
import { useTransactions } from '../../hooks/useTransactions'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function Transactions() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { transactions, loading: transactionsLoading, deleteTransaction, pagination, fetchTransactions } = useTransactions()
  const [filters, setFilters] = useState({
    search: '',
    transactionType: 'all',
    category: 'all',
    paymentMode: 'all',
    dateRange: 'all',
    startDate: null,
    endDate: null
  })

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setFilters(prev => ({
      ...prev,
      dateRange: 'custom',
      startDate: start,
      endDate: end
    }));
  };

  const currentPage = pagination?.page || 1;

  const debouncedFetch = useCallback(
    debounce((params) => {
      fetchTransactions(params);
    }, 500),
    []
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };

      debouncedFetch(params);
    }
  }, [currentPage, debouncedFetch, filters, user]);

  const handlePageChange = useCallback((newPage) => {
    fetchTransactions({
      page: newPage,
      limit: 10,
      ...filters
    });
  }, [fetchTransactions, filters]);

  if (authLoading || transactionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

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

  return (
    <DashboardLayout user={user}>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">Manage and track all your financial transactions</p>
          </div>
            <button
              onClick={() => router.push('/transactions/add')}
              className="btn-primary flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Transaction
            </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.transactionType}
                onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                className="form-input"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="form-input"
              >
                <option value="all">All Categories</option>
                {filters.transactionType === 'all' ? (
                  <>
                    <optgroup label="Income">
                      {categories.income.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Expenses">
                      {categories.expense.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </optgroup>
                  </>
                ) : filters.transactionType === 'income' ? (
                  categories.income.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))
                ) : (
                  categories.expense.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))
                )}
              </select>
            </div>

            {/* Payment Mode Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
              <select
                value={filters.paymentMode}
                onChange={(e) => handleFilterChange('paymentMode', e.target.value)}
                className="form-input"
              >
                <option value="all">All Modes</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                {/* Add more payment modes as needed */}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="form-input mb-2"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>

              {filters.dateRange === 'custom' && (
                <div className="mt-2">
                  <DatePicker
                    selectsRange={true}
                    startDate={filters.startDate}
                    endDate={filters.endDate}
                    onChange={handleDateChange}
                    className="form-input"
                    placeholderText="Select date range"
                    dateFormat="dd/MM/yyyy"
                    isClearable={true}
                    showYearDropdown
                    maxDate={new Date()}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setFilters({
                search: '',
                transactionType: 'all',
                category: 'all',
                paymentMode: 'all',
                dateRange: 'all',
                startDate: null,
                endDate: null
              })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all filters
            </button>
            {pagination &&
              <p className="text-sm text-gray-500">
                Showing {pagination.totalPages > 0 ? `${(currentPage - 1) * pagination.limit + 1}-${Math.min(currentPage * pagination.limit, pagination.total)}` : '0'} of {pagination.total} transactions
              </p>
            }
          </div>
        </div>

        {/* Transactions List */}
        <TransactionList
          transactions={transactions}
          onDelete={deleteTransaction}
          onEdit={(id) => router.push(`/transactions/edit/${id}`)}
        />

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {[...Array(pagination?.totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination?.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </DashboardLayout>
  )
}