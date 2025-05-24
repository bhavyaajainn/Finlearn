"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import DashboardNavbar from "@/components/DashboardNavbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { AppSidebar } from "@/components/Sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import FintechUI from "@/app/dashboard/components/Animation"
import { useAppSelector, useAppDispatch } from "@/app/store/hooks"
import { 
  fetchDashboardEssentials, 
  fetchStreakData, 
  fetchWatchlist,
  fetchTrendingNews
} from "@/app/store/slices/dashboardSlice"
import { fetchUserPreferences } from "@/app/store/slices/preferencesSlice"

// Create context for preferences state
const PreferencesContext = createContext<{
  preferencesChecked: boolean;
  setPreferencesChecked: (checked: boolean) => void;
}>({
  preferencesChecked: false,
  setPreferencesChecked: () => {}
});

export const usePreferencesContext = () => useContext(PreferencesContext);

const DASHBOARD_ANIMATION_KEY = 'finlearn_dashboard_animation_shown';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showAnimation, setShowAnimation] = useState(false)
  const [preferencesChecked, setPreferencesChecked] = useState(false)
  const [dataPreloaded, setDataPreloaded] = useState(false)
  const [animationChecked, setAnimationChecked] = useState(false)
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  console.log('=== DASHBOARD LAYOUT - ALWAYS ANIMATE ===')
  console.log('👤 user exists:', !!user)
  console.log('👤 user.uid:', user?.uid)
  console.log('🎬 showAnimation:', showAnimation)
  console.log('✅ animationChecked:', animationChecked)

  // Check if we should show animation on this dashboard load
  useEffect(() => {
    if (!user?.uid || animationChecked) return;

    console.log('🔍 Checking if animation should show...')
    
    try {
      // Check if animation was already shown for this specific dashboard visit
      const dashboardAnimationShown = sessionStorage.getItem(DASHBOARD_ANIMATION_KEY);
      
      if (!dashboardAnimationShown) {
        console.log('✨ Animation not shown for this dashboard visit - SHOWING animation')
        setShowAnimation(true);
        // Mark that animation will be shown for this dashboard visit
        sessionStorage.setItem(DASHBOARD_ANIMATION_KEY, 'true');
      } else {
        console.log('⚡ Animation already shown for this dashboard visit - SKIPPING')
        setShowAnimation(false);
        setDataPreloaded(true);
        setPreferencesChecked(true);
      }
    } catch (error) {
      console.log('❌ Error checking animation status, defaulting to SHOW animation')
      setShowAnimation(true);
    }
    
    setAnimationChecked(true);
  }, [user?.uid, animationChecked]);

  // Clear the flag when user navigates away from dashboard
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        sessionStorage.removeItem(DASHBOARD_ANIMATION_KEY);
        console.log('🧹 Cleared dashboard animation flag on page unload');
      } catch (error) {
        console.log('❌ Error clearing animation flag:', error);
      }
    };

    // Clear flag when component unmounts or page unloads
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also clear when component unmounts (navigation within app)
      try {
        sessionStorage.removeItem(DASHBOARD_ANIMATION_KEY);
        console.log('🧹 Cleared dashboard animation flag on component unmount');
      } catch (error) {
        console.log('❌ Error clearing animation flag on unmount:', error);
      }
    };
  }, []);

  // Preload data when animation starts or when skipping animation
  useEffect(() => {
    if (user?.uid && (showAnimation || (!showAnimation && animationChecked && !dataPreloaded))) {
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
        } catch (error) {
          console.error('❌ Error preloading dashboard data:', error)
          setDataPreloaded(true)
        }
      }

      preloadDashboardData()
    }
  }, [user?.uid, showAnimation, animationChecked, dataPreloaded, dispatch])

  const handleAnimationComplete = async () => {
    console.log('🎬 Animation completed, hiding animation...')
    setShowAnimation(false)
    
    if (user?.uid) {
      try {
        const preferencesResult = await dispatch(fetchUserPreferences(user.uid)).unwrap()
        console.log('⚙️ Preferences result:', preferencesResult)
        
        if (!preferencesResult?.expertise_level || !preferencesResult?.categories?.length) {
          console.log('⚙️ Preferences missing, will show dialog after delay')
          setTimeout(() => {
            setPreferencesChecked(true)
          }, 500)
        } else {
          console.log('✅ Preferences exist, setting checked to true')
          setPreferencesChecked(true)
        }
      } catch (error) {
        console.log('❌ Error fetching preferences, will show dialog after delay')
        setTimeout(() => {
          setPreferencesChecked(true)
        }, 500)
      }
    }
  }

  // Show loading while checking animation status
  if (!animationChecked) {
    console.log('⏳ Checking animation status...')
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Show animation if needed
  if (showAnimation) {
    console.log('🎥 RENDERING ANIMATION...')
    return (
      <ProtectedRoute>
        <div className="w-full h-screen bg-black">
          <FintechUI onAnimationComplete={handleAnimationComplete} />
        </div>
      </ProtectedRoute>
    )
  }

  // Show loading screen if data is not preloaded yet
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