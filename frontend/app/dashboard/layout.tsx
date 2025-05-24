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
import { useRouter, usePathname } from "next/navigation"

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
  const [isPreloading, setIsPreloading] = useState(false)
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { preferences, loading: preferencesLoading } = useAppSelector((state) => state.preferences)
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo(0, 0)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }, [pathname])

  useEffect(() => {
    if (user?.uid && !dataPreloaded && !isPreloading) {
      setIsPreloading(true)
      
      const preloadDashboardData = async () => {
        try {
          // First, fetch preferences separately to ensure they're loaded
          const preferencesPromise = dispatch(fetchUserPreferences(user.uid))
          
          // Other data can be fetched in parallel
          const otherPromises = [
            dispatch(fetchDashboardEssentials(user.uid)),
            dispatch(fetchStreakData({ userId: user.uid, refresh: false })),
            dispatch(fetchWatchlist({ userId: user.uid, limit: 5 })),
            dispatch(fetchTrendingNews(user.uid))
          ]
          
          // Wait for preferences first
          await preferencesPromise
          
          // Then wait for other data
          await Promise.allSettled(otherPromises)
          
          setDataPreloaded(true)
          
          // Small delay to ensure Redux state is fully updated
          setTimeout(() => {
            setPreferencesChecked(true)
          }, 100)
          
        } catch (error) {
          console.error('❌ Error preloading dashboard data:', error)
          setDataPreloaded(true)
          setPreferencesChecked(true)
        } finally {
          setIsPreloading(false)
        }
      }

      preloadDashboardData()
    }
  }, [user?.uid, dataPreloaded, isPreloading, dispatch])

  // Don't render until data is preloaded AND preferences are checked
  if (!dataPreloaded || !preferencesChecked) {
    return (
      <ProtectedRoute>
        <div className="w-full h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white text-lg">
              {!dataPreloaded ? "Loading..." : "Checking preferences..."}
            </p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

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