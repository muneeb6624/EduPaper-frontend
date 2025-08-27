import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, GraduationCap, FileText, Brain } from 'lucide-react';

const LoadingScreen = ({ onLoadingComplete }) => {
  const [currentIcon, setCurrentIcon] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [progress, setProgress] = useState(0);

  const icons = [BookOpen, GraduationCap, FileText, Brain];

  useEffect(() => {
    // Icon rotation every 600ms
    const iconInterval = setInterval(() => {
      setCurrentIcon(prev => (prev + 1) % icons.length);
    }, 600);

    // Show title after 800ms
    const titleTimer = setTimeout(() => {
      setShowTitle(true);
    }, 800);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Complete loading after 3 seconds
    const loadingTimer = setTimeout(() => {
      onLoadingComplete();
    }, 3000);

    return () => {
      clearInterval(iconInterval);
      clearInterval(progressInterval);
      clearTimeout(titleTimer);
      clearTimeout(loadingTimer);
    };
  }, [onLoadingComplete]);

  const CurrentIcon = icons[currentIcon];

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center z-[9999] overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
              y: [-20, 20],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Rotating Icon with Glow */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{
              boxShadow: '0 0 60px rgba(99, 102, 241, 0.6), 0 0 100px rgba(147, 51, 234, 0.3)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIcon}
                initial={{ scale: 0, rotate: -90, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentIcon className="w-10 h-10 text-white" />
              </motion.div>
            </AnimatePresence>
            
            {/* Orbital rings */}
            <div className="absolute -inset-3 rounded-full border border-blue-400/30 animate-pulse" />
            <div className="absolute -inset-6 rounded-full border border-purple-400/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </motion.div>
        </motion.div>

        {/* Title Animation */}
        <AnimatePresence>
          {showTitle && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 tracking-tight"
                initial={{ backgroundSize: "200%" }}
                animate={{ backgroundSize: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease infinite',
                }}
              >
                EduPaper
              </motion.h1>
              
              <motion.p
                className="text-lg md:text-xl text-slate-300 font-medium tracking-wide mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Smart Examination System
              </motion.p>
              
              {/* Loading dots */}
              <motion.div 
                className="flex justify-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Progress bar */}
      <motion.div
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-72 max-w-[80vw]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <div className="h-1 bg-slate-800/60 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/30">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full relative"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          >
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{
                animation: 'shimmer 2s infinite',
                transform: 'translateX(-100%)',
              }}
            />
          </motion.div>
        </div>
        
        {/* Progress text */}
        <motion.div
          className="mt-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <p className="text-xs text-slate-400 font-medium">
            Loading... {Math.round(progress)}%
          </p>
        </motion.div>
      </motion.div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;