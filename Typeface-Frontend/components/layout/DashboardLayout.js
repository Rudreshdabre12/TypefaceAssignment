'use client'

import { useState } from 'react'
import Header from './Header'
import Sidebar from '../ui/Sidebar'

export default function DashboardLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : ''} transition-all duration-300`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} user={user} />
        
        {children}
      </div>
    </div>
  )
}