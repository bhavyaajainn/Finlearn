import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  PiggyBank, 
  Banknote, 
  Coins, 
  Wallet, 
  Building2,
  BarChart3,
  LineChart,
  Calculator,
  Smartphone,
  Shield,
  Lock,
  Globe,
  Zap
} from 'lucide-react';

const fintechIcons = [
  DollarSign, TrendingUp, CreditCard, PiggyBank, Banknote, Coins, 
  Wallet, Building2, BarChart3, LineChart, Calculator, Smartphone, 
  Shield, Lock, Globe, Zap
];

const FloatingSymbol = ({ Icon, position, delay, size }: { Icon: React.ComponentType<{ size: number }>, position: { x: number, y: number }, delay: number, size: number }) => {
  return (
    <motion.div
      className="fixed text-blue-300 opacity-40 pointer-events-none z-0"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 0.4, 0.6, 0.4],
        scale: [0.8, 1, 1.1, 1],
        y: [-10, 10, -10],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration: 4 + Math.random() * 2,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Icon size={size} />
    </motion.div>
  );
};

const TypingAnimation = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        const timer = setInterval(() => {
          setCurrentIndex((prevIndex) => {
            if (prevIndex < text.length) {
              setDisplayedText(text.slice(0, prevIndex + 1));
              return prevIndex + 1;
            } else {
              clearInterval(timer);
              return prevIndex;
            }
          });
        }, 150);
        return () => clearInterval(timer);
      }
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [text, delay, currentIndex]);

  return (
    <motion.span
      className="inline-block"
      initial={{ opacity: 0 }}
      animate={{ opacity: currentIndex > 0 ? 1 : 0 }}
    >
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block"
        >
          |
        </motion.span>
      )}
    </motion.span>
  );
};

interface FintechUIProps {
  onAnimationComplete?: () => void;
}

const Animation = ({ onAnimationComplete }: FintechUIProps) => {
  const [symbols, setSymbols] = useState<{ 
    id: number; 
    Icon: React.ComponentType<{ size: number }>; 
    position: { x: number; y: number }; 
    delay: number; 
    size: number; 
  }[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [audioLoaded, setAudioLoaded] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const audio = new Audio();
        audio.volume = 0.1;
        audio.preload = 'auto';
        const audioSources = [
          '/sounds/cinematic.mp3'
        ];
        
        let audioLoaded = false;
        
        for (const source of audioSources) {
          try {
            audio.src = source;
            await new Promise((resolve, reject) => {
              audio.addEventListener('canplaythrough', () => {
                resolve(true);
                audioLoaded = true;
              }, { once: true });
              
              audio.addEventListener('error', reject, { once: true });
          
              setTimeout(() => reject(new Error('Audio load timeout')), 2000);
            });
        
            break;
          } catch (error) {
            console.warn(`Failed to load audio from ${source}:`, error);
            continue;
          }
        }
        
        if (audioLoaded) {
        
          try {
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
              await playPromise;
              
            }
          } catch (playError) {
            console.warn('Audio autoplay prevented by browser:', playError);
            
          }
          
          setAudioLoaded(true);
        } else {
          console.warn('No audio format could be loaded');
        }
        
      } catch (error) {
        console.warn('Audio initialization failed:', error);
      }
    };

  
    initializeAudio();
    
   
    const animationTimer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 6000);

    return () => {
      clearTimeout(animationTimer);
    };
  }, [onAnimationComplete]);

  const checkOverlap = (newPos: { x: number; y: number; } | undefined, existingPositions: any[], minDistance: number) => {
    if (!newPos) return true;
    return existingPositions.some(pos => {
      const distance = Math.sqrt(
        Math.pow(newPos.x - pos.x, 2) + Math.pow(newPos.y - pos.y, 2)
      );
      return distance < minDistance;
    });
  };

  useEffect(() => {
    const generateSymbols = () => {
      if (dimensions.width === 0) return;

      const symbolCount = dimensions.width < 768 ? 15 : dimensions.width < 1024 ? 25 : 35;
      const newSymbols = [];
      const positions = [];
      const minDistance = dimensions.width < 768 ? 8 : dimensions.width < 1024 ? 10 : 12;
      const baseSize = dimensions.width < 768 ? 20 : dimensions.width < 1024 ? 24 : 28;
      
      const centerZone = {
        x: { min: 25, max: 75 },
        y: { min: 25, max: 75 }
      };
      
      for (let i = 0; i < symbolCount; i++) {
        let attempts = 0;
        let position;
        
        do {
          let x, y;
          
          if (Math.random() < 0.6) {
            if (Math.random() < 0.5) {
              x = 8 + Math.random() * 25;
            } else {
              x = 67 + Math.random() * 25;
            }
            y = 8 + Math.random() * 84;
          } else {
            x = 8 + Math.random() * 84;
            if (Math.random() < 0.5) {
              y = 8 + Math.random() * 25;
            } else {
              y = 67 + Math.random() * 25;
            }
          }
          
          const inCenterZone = (
            x >= centerZone.x.min && x <= centerZone.x.max &&
            y >= centerZone.y.min && y <= centerZone.y.max
          );
          
          if (!inCenterZone) {
            position = { x, y };
          }
          
          attempts++;
        } while (
          (checkOverlap(position, positions, minDistance) || !position) && 
          attempts < 50
        );
        
        if (position) {
          const IconComponent = fintechIcons[Math.floor(Math.random() * fintechIcons.length)];
          positions.push(position);
          
          newSymbols.push({
            id: i,
            Icon: IconComponent,
            position: position,
            delay: i * 0.1 + Math.random() * 2,
            size: baseSize + Math.random() * 12,
          });
        }
      }
      setSymbols(newSymbols);
    };

    generateSymbols();
  }, [dimensions]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {symbols.map((symbol) => (
        <FloatingSymbol
          key={symbol.id}
          Icon={symbol.Icon}
          position={symbol.position}
          delay={symbol.delay}
          size={symbol.size}
        />
      ))}
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-center"
        >
          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8"
            style={{ 
              fontFamily: "'Helvetica Neue', 'Arial Black', sans-serif",
              letterSpacing: '-0.02em',
              lineHeight: '0.9'
            }}
            animate={{ 
              textShadow: [
                '0 0 20px rgb(147, 197, 253)',
                '0 0 30px rgb(147, 197, 253)',
                '0 0 20px rgb(147, 197, 253)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TypingAnimation text="FinLearn" delay={0.5} />
            <span className="mx-4"></span>
            <span className="text-blue-400">
              <TypingAnimation text="AI" delay={2.5} />
            </span>
          </motion.h1>
          
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
          >
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl text-white font-light"
              style={{ 
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                letterSpacing: '0.01em'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.2 }}
            >
              Your personalized finance knowledge platform
            </motion.p>
            <motion.p
              className="text-sm md:text-base text-blue-300 font-normal"
              style={{ 
                fontFamily: "'Helvetica Neue', Arial, sans-serif"
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.6 }}
            >
              Powered by Perplexity AI
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Animation;