"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/app/store/hooks'
import { checkAuthState } from '@/app/store/slices/authSlice'
import { toast } from 'sonner'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { user, loading, error, verificationEmailSent } = useAppSelector((state) => state.auth)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {

      if (user) {
        setAuthChecked(true)
        return
      }
      
      try {
        await dispatch(checkAuthState()).unwrap()
        setAuthChecked(true)
      } catch (error) {
        console.error('Failed to check auth state:', error)
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [dispatch, user])

  useEffect(() => {
    // Only redirect after auth state has been checked
    if (authChecked && !loading) {
      if (!user && pathname.startsWith('/dashboard')) {
        toast.error('Please sign in to access this page')
        router.push('/')
      }
      if (user && !user.emailVerified && pathname !== '/dashboard') {
        toast.warning('Please verify your email to access all features')
      }
    }
  }, [authChecked, user, loading, router, pathname])

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user && pathname.startsWith('/dashboard')) {
    return null 
  }

  return <>{children}</>
}