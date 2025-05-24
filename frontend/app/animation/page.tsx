"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/app/store/hooks';
import FintechUI from '@/app/dashboard/components/Animation';

export default function AnimationPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

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