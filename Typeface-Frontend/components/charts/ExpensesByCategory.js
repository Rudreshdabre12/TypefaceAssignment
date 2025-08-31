'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
]

export default function ExpensesByCategory({ categoryData = [], totalExpenses = 0 }) {

  const chartData = categoryData
    .sort((a, b) => b.amount - a.amount)
    .map(item => ({
      name: item.name,
      value: item.amount,
      amount: item.amount,
      percentage: item.percentage
    }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            Amount: ₹{data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {data.payload.percentage}%
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No expense data available</p>
            <p className="text-sm">Add some expenses to see the breakdown</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Expenses by Category</h3>
        <div className="text-sm text-gray-500">
          Total: ₹{totalExpenses.toLocaleString()}
        </div>
      </div>

      <div className="h-[400px]"> {/* Increased height for better visibility */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%" 
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={130} 
              innerRadius={60} 
              fill="#8884d8"
              dataKey="value"
              paddingAngle={1} 
              startAngle={90} 
              endAngle={450} 
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '20px',
                maxHeight: '60px',
                overflowY: 'auto',
                bottom: 0
              }}
              iconSize={10}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category List with Scrollable Container */}
      <div className="mt-4 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm pr-2">
          {chartData.map((item, index) => (
            <div 
              key={item.name} 
              className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded"
            >
              <div className="flex items-center max-w-[70%]">
                <div
                  className="min-w-[12px] h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-700 truncate" title={item.name}>
                  {item.name}
                </span>
              </div>
              <span className="font-medium text-gray-900 ml-2 flex-shrink-0">
                ₹{item.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}