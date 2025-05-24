"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import FintechUI from '@/app/dashboard/components/Animation';
import { 
  fetchDashboardEssentials, 
  fetchStreakData, 
  fetchWatchlist,
  fetchTrendingNews
} from '@/app/store/slices/dashboardSlice';
import { fetchUserPreferences } from '@/app/store/slices/preferencesSlice';
import { fetchTopics } from '@/app/store/slices/learningSlice';

export default function AnimationPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Preload all dashboard data during animation
  useEffect(() => {
    if (user?.uid) {
      console.log('🚀 Starting to preload all dashboard data during animation...');
      const preloadAllData = async () => {
        try {
          const promises = [
            dispatch(fetchDashboardEssentials(user.uid)),
            dispatch(fetchStreakData({ userId: user.uid, refresh: false })),
            dispatch(fetchWatchlist({ userId: user.uid, limit: 5 })),
            dispatch(fetchTrendingNews(user.uid)),
            dispatch(fetchUserPreferences(user.uid)),
            dispatch(fetchTopics(user.uid)) // Added recommended topics API call
          ];
          
          await Promise.allSettled(promises);
          console.log('✅ All dashboard data preloaded successfully during animation');
        } catch (error) {
          console.error('❌ Error preloading data during animation:', error);
        }
      };

      preloadAllData();
    }
  }, [user?.uid, dispatch]);

  const handleAnimationComplete = () => {
    console.log('🎬 Animation completed, redirecting to dashboard...');
    router.push('/dashboard');
  };

  // Show loading if no user
  if (!user) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black">
      <FintechUI onAnimationComplete={handleAnimationComplete} />
    </div>
  );
}