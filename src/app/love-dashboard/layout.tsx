"use client"

import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileSidebar } from '@/components/dashboard/MobileSidebar'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
    }
  }, [currentUser, router])

  if (!currentUser) {
    return null
  }

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header with Menu */}
        <div className="md:hidden border-b p-4">
          <div className="flex items-center justify-between">
            <MobileSidebar />
            <span className="font-semibold text-lg">Love Dashboard</span>
            <div className="w-9" /> {/* Spacer for alignment */}
          </div>
        </div>
        
        {children}
      </main>
    </div>
  )
}