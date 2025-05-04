
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/app/store/hooks'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
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