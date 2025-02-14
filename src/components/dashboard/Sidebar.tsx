"use client"

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronLeft, ChevronRight, CreditCard, LogOut, Settings, Image, Home, TriangleDashed, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const sidebarLinks = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'Background Selector',
    href: '/love-dashboard/background',
    icon: Image,
  },
  {
    title: 'Couple Management',
    href: '/love-dashboard/couple',
    icon: Heart,
  },
  {
    title: 'More coming soon...',
    href: '/',
    icon: TriangleDashed,
  },
  // Add more dashboard links here
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { currentUser, logout } = useAuth()
  const pathname = usePathname()
  
  // Get display name or first part of email
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'

  return (
    <div
      className={cn(
        'h-screen border-r flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 flex justify-between items-center border-b">
        <span className={cn(
          'font-semibold text-lg truncate',
          collapsed && 'w-0 overflow-hidden'
        )}>
          Love Dashboard
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <nav className="flex-1 p-2">
        {sidebarLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={pathname === link.href ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start mb-1',
                  collapsed && 'justify-center'
                )}
              >
                <Icon className="h-4 w-4" />
                {!collapsed && <span className="ml-2">{link.title}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                'w-full flex items-center gap-2',
                collapsed ? 'p-0 justify-center' : 'justify-start'
              )}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                {displayName[0].toUpperCase()}
              </div>
              {!collapsed && <span className="font-medium truncate">{displayName}</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-100" align="end" forceMount>
            <div className="flex items-center gap-2 p-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                {displayName[0].toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{displayName}</span>
                <span className="text-sm text-muted-foreground truncate">{currentUser?.email}</span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="w-4 h-4 mr-2" />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}