'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * LUXURY STARTUP BRAND INTRO
 * Duration: 3.0s total
 * Sequence: Glow -> Draw -> Fill -> Text -> Seamless Merge
 */
const ENABLE_BRAND_INTRO = true;

export const BrandIntro = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState(0); // 0: Ambient, 1: Draw, 2: Fill, 3: Text, 4: Merge

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const hasSeenIntro = sessionStorage.getItem('eb_luxury_intro_shown');

    if (!ENABLE_BRAND_INTRO || !isMobile || hasSeenIntro) {
      setIsVisible(false);
      return;
    }

    // High-precision sequence timing
    const timers = [
      setTimeout(() => setStage(1), 800),   // Start Drawing (0.8s)
      setTimeout(() => setStage(2), 1500),  // Start Filling (1.5s)
      setTimeout(() => setStage(3), 2200),  // Show Text (2.2s)
      setTimeout(() => setStage(4), 2700),  // Merge Transition (2.7s)
      setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('eb_luxury_intro_shown', 'true');
      }, 3300), // Cleanup
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-all duration-700 ease-in-out overflow-hidden",
        stage === 4 ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {/* 0. Ambient Orange Glow */}
      <div className={cn(
        "absolute w-[150vw] h-[150vw] rounded-full blur-[120px] transition-all duration-1000 ease-out",
        stage >= 0 ? "bg-primary/10 scale-100 opacity-100" : "bg-transparent scale-50 opacity-0"
      )} />

      {/* 1 & 2: SVG Logo Drawing & Fill */}
      <div className={cn(
        "relative z-10 transition-all duration-500 ease-in-out transform",
        stage === 4 ? "scale-50 -translate-x-[40%] -translate-y-[45%]" : "scale-100"
      )}>
        <svg 
          width="120" 
          height="120" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-primary overflow-visible"
        >
          {/* Main Body Path */}
          <path 
            d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" 
            className={cn(
              "transition-all duration-[1000ms] ease-in-out",
              stage === 0 ? "stroke-dasharray-[100] stroke-dashoffset-[100]" : "stroke-dasharray-[100] stroke-dashoffset-0",
              stage >= 2 ? "fill-primary text-primary" : "fill-transparent"
            )}
          />
          <path 
            d="m3 6h18" 
            className={cn(
              "transition-all duration-[800ms] delay-300 ease-in-out",
              stage === 0 ? "opacity-0" : "opacity-100"
            )}
          />
          <path 
            d="M16 10a4 4 0 0 1-8 0" 
            className={cn(
              "transition-all duration-[800ms] delay-500 ease-in-out",
              stage === 0 ? "stroke-dasharray-[20] stroke-dashoffset-[20]" : "stroke-dasharray-[20] stroke-dashoffset-0"
            )}
          />
          
          {/* Light Sweep Effect Overlay */}
          {stage >= 2 && (
            <rect x="0" y="0" width="24" height="24" className="animate-sweep fill-white/20 mix-blend-overlay" />
          )}
        </svg>
      </div>

      {/* 3. Brand Identity Reveal */}
      <div className={cn(
        "mt-8 text-center transition-all duration-700 ease-out transform",
        stage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        stage === 4 && "opacity-0 scale-90"
      )}>
        <h1 className="text-5xl font-black font-headline tracking-[-0.05em] text-white uppercase mb-2">
          Ezzy<span className="text-primary italic">Bites</span>
        </h1>
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-8 bg-white/10" />
          <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white/40">
            Fast • Fresh • Delicious
          </p>
          <div className="h-[1px] w-8 bg-white/10" />
        </div>
      </div>

      {/* Luxury Progress Line */}
      <div className={cn(
        "absolute bottom-16 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-white/5 overflow-hidden transition-opacity duration-500",
        stage === 4 ? "opacity-0" : "opacity-100"
      )}>
        <div className={cn(
          "h-full bg-primary transition-all duration-[3000ms] ease-linear",
          stage >= 0 ? "w-full" : "w-0"
        )} />
      </div>

      <style jsx>{`
        @keyframes sweep {
          0% { transform: translateX(-100%) skewX(-45deg); }
          100% { transform: translateX(200%) skewX(-45deg); }
        }
        .animate-sweep {
          animation: sweep 1.5s infinite;
        }
      `}</style>
    </div>
  );
};
