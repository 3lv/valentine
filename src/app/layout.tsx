import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import React from 'react'; // Added import for React

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Valentine\'s Day Special',
  description: 'A special website for my girlfriend',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <html lang="en" suppressHydrationWarning>
          <body className={inter.className}>
              <AuthProvider>
                  <ThemeProvider
                      attribute="class"
                      defaultTheme="dark"
                      enableSystem
                      disableTransitionOnChange
                  >
                      {children}
                  </ThemeProvider>
              </AuthProvider>
          </body>
      </html>
  )
}
