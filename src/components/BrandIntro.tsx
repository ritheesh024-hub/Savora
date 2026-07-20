'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShoppingBag, Coffee, Pizza, Utensils, Zap } from 'lucide-react';

/**
 * LUXURY STARTUP 3D-FEEL INTRO
 * Optimized for Mobile/Tablets
 * Duration: 3.0s
 */
const ENABLE_BRAND_INTRO = true;

export const BrandIntro = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState(0); // 0: 3D Coffee, 1: Food Platter, 2: Zoom, 3: Assemble Logo, 4: Merge

  useEffect(() => {
    const isPC = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const hasSeenIntro = sessionStorage.getItem('savora_luxury_intro_shown');

    if (!ENABLE_BRAND_INTRO || isPC || hasSeenIntro) {
      setIsVisible(false);
      return;
    }

    // Sequence timings
    const timers = [
      setTimeout(() => setStage(1), 800),   // Transition to Platter (0.8s)
      setTimeout(() => setStage(2), 1500),  // Camera Zoom (1.5s)
      setTimeout(() => setStage(3), 2200),  // Assemble Logo (2.2s)
      setTimeout(() => setStage(4), 2700),  // Seamless Merge (2.7s)
      setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('savora_luxury_intro_shown', 'true');
      }, 3200), // Cleanup
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-[#FFFAF3] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Gradient Ambiance */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5ED] via-[#FFFAF3] to-white" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      {/* 3D Content Container */}
      <div className="relative z-10 w-64 h-64 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Stage 0: 3D Coffee Cup */}
          {stage === 0 && (
            <motion.div
              key="coffee"
              initial={{ opacity: 0, scale: 0.5, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 360 }}
              exit={{ opacity: 0, scale: 1.2, rotateY: 720 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-24 h-32 bg-white rounded-t-xl rounded-b-[2rem] border-4 border-primary/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-4 left-0 w-full h-8 bg-primary/10" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary/20 rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0" />
              </div>
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40"
              >
                Brewing Excellence
              </motion.span>
            </motion.div>
          )}

          {/* Stage 1 & 2: Food Platter Showcase */}
          {(stage === 1 || stage === 2) && (
            <motion.div
              key="platter"
              initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
              animate={{ 
                opacity: 1, 
                scale: stage === 2 ? 1.5 : 1, 
                rotate: stage === 2 ? 360 : 0 
              }}
              exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="relative flex items-center justify-center"
            >
              {/* Platter Base */}
              <div className="w-48 h-48 bg-white rounded-full shadow-3xl border border-primary/10 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <Pizza className="w-10 h-10 text-primary opacity-20" />
                  <Utensils className="w-10 h-10 text-orange-400 opacity-20" />
                  <ShoppingBag className="w-10 h-10 text-red-400 opacity-20" />
                  <Zap className="w-10 h-10 text-amber-500 opacity-20" />
                </div>
              </div>
              
              {/* Particle Elements orbiting */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, delay: i * 0.1 }
                  }}
                  className="absolute w-2 h-2 bg-primary/20 rounded-full"
                  style={{
                    left: `${50 + 60 * Math.cos(i * 45 * Math.PI / 180)}%`,
                    top: `${50 + 60 * Math.sin(i * 45 * Math.PI / 180)}%`,
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Stage 3 & 4: Logo Assembly & Merge */}
          {(stage === 3 || stage === 4) && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: stage === 4 ? 0.4 : 1,
                x: stage === 4 ? -120 : 0,
                y: stage === 4 ? -320 : 0
              }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-orange-gradient rounded-3xl flex items-center justify-center shadow-3xl transform rotate-12 mb-6">
                <ShoppingBag className="w-12 h-12 text-white" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "transition-opacity duration-300",
                  stage === 4 ? "opacity-0" : "opacity-100"
                )}
              >
                <h1 className="text-4xl font-black font-headline tracking-tighter text-foreground uppercase mb-2">
                  Savora
                </h1>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
                  Fast • Fresh • Delicious
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Luxury Progress Bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-primary/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 3.0, ease: "linear" }}
          className="h-full bg-primary"
        />
      </div>
    </motion.div>
  );
};
