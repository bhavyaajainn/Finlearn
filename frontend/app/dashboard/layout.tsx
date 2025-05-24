"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import DashboardNavbar from "@/components/DashboardNavbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useAppSelector, useAppDispatch } from "@/app/store/hooks"
import { 
  fetchDashboardEssentials, 
  fetchStreakData, 
  fetchWatchlist,
  fetchTrendingNews
} from "@/app/store/slices/dashboardSlice"
import { fetchUserPreferences } from "@/app/store/slices/preferencesSlice"

const PreferencesContext = createContext<{
  preferencesChecked: boolean;
  setPreferencesChecked: (checked: boolean) => void;
}>({
  preferencesChecked: false,
  setPreferencesChecked: () => {}
});

export const usePreferencesContext = () => useContext(PreferencesContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [preferencesChecked, setPreferencesChecked] = useState(false)
  const [dataPreloaded, setDataPreloaded] = useState(false)
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  console.log('=== DASHBOARD LAYOUT - SIMPLE VERSION ===')
  console.log('👤 user exists:', !!user)
  console.log('📊 dataPreloaded:', dataPreloaded)

  // Preload dashboard data when user is available
  useEffect(() => {
    if (user?.uid && !dataPreloaded) {
      console.log('🚀 Starting to preload dashboard data...')
      const preloadDashboardData = async () => {
        try {
          const promises = [
            dispatch(fetchDashboardEssentials(user.uid)),
            dispatch(fetchStreakData({ userId: user.uid, refresh: false })),
            dispatch(fetchWatchlist({ userId: user.uid, limit: 5 })),
            dispatch(fetchTrendingNews(user.uid)),
            dispatch(fetchUserPreferences(user.uid))
          ]
          
          await Promise.allSettled(promises)
          console.log('✅ Dashboard data preloaded successfully')
          setDataPreloaded(true)
          
          // Check preferences after data is loaded
          const preferencesResult = await dispatch(fetchUserPreferences(user.uid)).unwrap()
          console.log('⚙️ Preferences result:', preferencesResult)
          
          if (!preferencesResult?.expertise_level || !preferencesResult?.categories?.length) {
            console.log('⚙️ Preferences missing, will show dialog')
            setTimeout(() => {
              setPreferencesChecked(true)
            }, 500)
          } else {
            console.log('✅ Preferences exist, setting checked to true')
            setPreferencesChecked(true)
          }
        } catch (error) {
          console.error('❌ Error preloading dashboard data:', error)
          setDataPreloaded(true)
          setTimeout(() => {
            setPreferencesChecked(true)
          }, 500)
        }
      }

      preloadDashboardData()
    }
  }, [user?.uid, dataPreloaded, dispatch])

  // Show loading screen while data is preloading
  if (!dataPreloaded) {
    console.log('📊 Showing loading screen while data preloads...')
    return (
      <ProtectedRoute>
        <div className="w-full h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading Dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  console.log('🏠 RENDERING MAIN DASHBOARD LAYOUT...')
  return (
    <ProtectedRoute>
      <PreferencesContext.Provider value={{ preferencesChecked, setPreferencesChecked }}>
        <SidebarProvider>
          <div className="flex w-full min-h-screen bg-black">
            <div className="block md:hidden">
              <AppSidebar />
            </div>

            <div className="flex flex-col flex-1">
              <DashboardNavbar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </PreferencesContext.Provider>
    </ProtectedRoute>
  )
}