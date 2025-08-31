'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function IncomeVsExpense({ monthlyData = [], currentMonth = {}, averages = {}, bestMonth = {} }) {

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Income:
              </span>
              <span className="font-medium">₹{data.income.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Expense:
              </span>
              <span className="font-medium">₹{data.expense.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-1">
              <span className="font-medium">Net:</span>
              <span className={`font-medium ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{data.net.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.transactions} transactions
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const hasData = monthlyData.some(d => d.income > 0 || d.expense > 0)

  if (!hasData) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses (Last 6 Months)</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No data for the last 6 months</p>
            <p className="text-sm">Add transactions to see monthly trends</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses (Last 6 Months)</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
            <span>Income</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span>Expenses</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="month"
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              name="Income"
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#EF4444"
              strokeWidth={3}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              name="Expenses"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Month */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">This Month</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Income:</span>
              <span className="font-medium text-blue-900">₹{currentMonth.income.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Expenses:</span>
              <span className="font-medium text-blue-900">₹{currentMonth.expense.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-blue-200 pt-1">
              <span className="font-medium text-blue-700">Net:</span>
              <span className={`font-bold ${currentMonth.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{currentMonth.net.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 6-Month Average */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">6-Month Average</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Income:</span>
              <span className="font-medium text-green-900">₹{averages.income.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Expenses:</span>
              <span className="font-medium text-green-900">₹{averages.expense.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-green-200 pt-1">
              <span className="font-medium text-green-700">Net:</span>
              <span className={`font-bold ${averages.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{averages.net.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Best Month */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-900 mb-2">Best Month</h4>
          <div className="space-y-1">
            <div className="text-sm text-purple-700 font-medium">{bestMonth.month}</div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Income:</span>
              <span className="font-medium text-purple-900">₹{bestMonth.income.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Expenses:</span>
              <span className="font-medium text-purple-900">₹{bestMonth.expense.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-purple-200 pt-1">
              <span className="font-medium text-purple-700">Net:</span>
              <span className="font-bold text-green-600">₹{bestMonth.net.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}