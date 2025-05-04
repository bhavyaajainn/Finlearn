"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/app/store/hooks'
import { checkAuthState } from '@/app/store/slices/authSlice'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, loading } = useAppSelector((state) => state.auth)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // If we already have a user in the Redux store, no need to check again
      if (user) {
        setAuthChecked(true)
        return
      }
      
      // Otherwise, check auth state (this will also check session storage)
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
    if (authChecked && !loading && !user) {
      router.push('/')
    }
  }, [authChecked, user, loading, router])

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user) {
    return null 
  }

  return <>{children}</>
}