import { useState, useEffect, useCallback } from 'react'
import { getTransactions, deleteTransaction as deleteTransactionAPI, getTransactionStats, getExpensesByCategory, getIncomeVsExpenses, getExpensesByDate } from '../lib/api'

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({})
  const [byCategory, setByCategory] = useState({});
  const [byDate, setByDate] = useState({});
  const [incVsExp, setIncVsExp] = useState({});
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const fetchTransactions = useCallback(async (params = {}) => {
    try {
      setLoading(true);

      const queryParams = new URLSearchParams(params).toString();
      const response = await getTransactions(queryParams);

      if (response.success) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransaction = async (id) => {
    try {
      const result = await deleteTransactionAPI(id)
      if (result.success) {
        setTransactions(prev => prev.filter(t => t._id !== id))
        return { success: true }
      } else {
        setError(result.message || 'Failed to delete transaction')
        return { success: false, message: result.message }
      }
    } catch (err) {
      setError('An error occurred while deleting transaction')
      console.error('Delete transaction error:', err)
      return { success: false, message: 'Delete failed' }
    }
  }

  const addTransaction = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev])
  }

  const updateTransaction = (id, updatedTransaction) => {
    setTransactions(prev =>
      prev.map(t => t._id === id ? { ...t, ...updatedTransaction } : t)
    )
  }

  const generalStats = async () => {
    try {
      const response = await getTransactionStats();

      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  const expensesByCategory = async () => {
    try {
      const response = await getExpensesByCategory();

      if (response.success) {
        setByCategory(response.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  const expensesByDate = async () => {
    try {
      const response = await getExpensesByDate();

      if (response.success) {
        setByDate(response.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  const IncomeVSExpenses = async () => {
    try {
      const response = await getIncomeVsExpenses();

      if (response.success) {
        setIncVsExp(response.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTransactions()
    generalStats()
    expensesByCategory()
    expensesByDate()
    IncomeVSExpenses()
  }, [])

  return {
    transactions,
    pagination,
    stats,
    loading,
    error,
    byCategory, 
    byDate, 
    incVsExp,
    fetchTransactions,
    deleteTransaction,
    addTransaction,
    updateTransaction,
    refetch: fetchTransactions
  }
}