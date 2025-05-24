"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import Animation from '@/app/dashboard/components/Animation';
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
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);
 
  useEffect(() => {
    if (user?.uid) {
      const preloadAllData = async () => {
        try {
          const promises = [
            dispatch(fetchDashboardEssentials(user.uid)),
            dispatch(fetchStreakData({ userId: user.uid, refresh: false })),
            dispatch(fetchWatchlist({ userId: user.uid, limit: 5 })),
            dispatch(fetchTrendingNews(user.uid)),
            dispatch(fetchUserPreferences(user.uid)),
            dispatch(fetchTopics(user.uid))
          ];
          
          await Promise.allSettled(promises);
        } catch (error) {
          console.error('Error preloading data during animation:', error);
        }
      };

      preloadAllData();
    }
  }, [user?.uid, dispatch]);

  const handleAnimationComplete = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      router.push('/dashboard');
    }, 100);
  };

  
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
      <Animation onAnimationComplete={handleAnimationComplete} />
    </div>
  );
}