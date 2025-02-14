"use client"

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Menu, X, CreditCard, LogOut, Settings, Image, Home, TriangleDashed, Heart } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const pathname = usePathname()
  
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Love Dashboard</SheetTitle>
          </SheetHeader>

          <nav className="flex-1 p-4">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  <Button
                    variant={pathname === link.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start mb-2"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{link.title}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center gap-2 justify-start">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                    {displayName[0].toUpperCase()}
                  </div>
                  <span className="font-medium truncate">{displayName}</span>
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
      </SheetContent>
    </Sheet>
  )
} 