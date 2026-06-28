'use client'

import { useEffect, useState } from 'react'
import Navigation from './navigation'
import { Toaster } from '@/components/ui/toaster'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: 'admin' | 'manager' | 'client'
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [userName, setUserName] = useState<string>('')
  const [userAvatar, setUserAvatar] = useState<string>('')

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserName(user.name || user.profile?.firstName + ' ' + user.profile?.lastName || 'User')
      setUserAvatar(user.profile?.avatar || '')
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation 
        userRole={userRole} 
        userName={userName}
        userAvatar={userAvatar}
      />
      <main className="flex-1">
        {children}
      </main>
      <Toaster />
    </div>
  )
}