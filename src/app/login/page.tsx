"use client"

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Google } from '@/components/icons/Google'

export default function LoginPage() {
  const { currentUser, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (currentUser) {
      router.push('/love-dashboard/background')
    }
  }, [currentUser, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-love/50" />
            Valentine's Special
          </CardTitle>
          <CardDescription>Sign in to access your love dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">Sign in with</span>
            <Separator className="flex-1" />
          </div>
          <div className="mt-4">
            <Button onClick={signInWithGoogle} className="w-full" variant="outline">
              <Google className="h-4 w-4 mr-1" /> Continue with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  )
}