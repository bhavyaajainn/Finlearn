"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AnimationContextType {
  shouldShowAnimation: boolean;
  markAnimationShown: () => void;
  resetAnimation: () => void;
  isInitialized: boolean;
}

const AnimationContext = createContext<AnimationContextType>({
  shouldShowAnimation: true, // Default to true
  markAnimationShown: () => {},
  resetAnimation: () => {},
  isInitialized: false
});

export const useAnimationContext = () => useContext(AnimationContext);

const ANIMATION_SHOWN_KEY = 'finlearn_animation_shown';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [shouldShowAnimation, setShouldShowAnimation] = useState(true); // Start with true
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('🎬 AnimationProvider initializing...');
    
    const checkAnimationStatus = () => {
      try {
        const animationData = sessionStorage.getItem(ANIMATION_SHOWN_KEY);
        console.log('📊 Animation data from sessionStorage:', animationData);
        
        if (!animationData) {
          console.log('✨ First time user or new session - SHOW animation');
          setShouldShowAnimation(true);
          setIsInitialized(true);
          return;
        }

        const { timestamp } = JSON.parse(animationData);
        const now = Date.now();
        const timeDiff = now - timestamp;
        
        console.log('⏰ Time since last animation:', Math.floor(timeDiff / 1000 / 60), 'minutes');
        
        if (timeDiff > SESSION_DURATION) {
          console.log('⏳ Session expired - SHOW animation');
          sessionStorage.removeItem(ANIMATION_SHOWN_KEY);
          setShouldShowAnimation(true);
        } else {
          console.log('⚡ Within session time - SKIP animation');
          setShouldShowAnimation(false);
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('❌ Error checking animation status:', error);
        console.log('🔄 Fallback - SHOW animation');
        setShouldShowAnimation(true);
        setIsInitialized(true);
      }
    };

    // Add a small delay to ensure sessionStorage is available
    const timer = setTimeout(checkAnimationStatus, 100);
    return () => clearTimeout(timer);
  }, []);

  const markAnimationShown = () => {
    console.log('✅ Marking animation as shown');
    try {
      const animationData = {
        timestamp: Date.now(),
        shown: true
      };
      sessionStorage.setItem(ANIMATION_SHOWN_KEY, JSON.stringify(animationData));
      setShouldShowAnimation(false);
    } catch (error) {
      console.error('❌ Failed to mark animation as shown:', error);
      setShouldShowAnimation(false);
    }
  };

  const resetAnimation = () => {
    console.log('🔄 Resetting animation');
    try {
      sessionStorage.removeItem(ANIMATION_SHOWN_KEY);
      setShouldShowAnimation(true);
    } catch (error) {
      console.error('❌ Failed to reset animation:', error);
    }
  };

  console.log('🎬 AnimationProvider state:', { shouldShowAnimation, isInitialized });

  return (
    <AnimationContext.Provider value={{
      shouldShowAnimation,
      markAnimationShown,
      resetAnimation,
      isInitialized
    }}>
      {children}
    </AnimationContext.Provider>
  );
}