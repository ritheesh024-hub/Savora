'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, MonitorOff, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * PREVENTS PC USAGE
 * Forces users to use Mobile or Tablet for the premium experience.
 */
export const MobileOnlyGuard = ({ children }: { children: React.ReactNode }) => {
  const [isPC, setIsPC] = useState<boolean | null>(null);

  useEffect(() => {
    const checkScreen = () => {
      // Logic: If width >= 1024px, we consider it a desktop/PC
      setIsPC(window.innerWidth >= 1024);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // While checking, render nothing to avoid flicker
  if (isPC === null) return null;

  if (isPC) {
    return (
      <div className="min-h-screen bg-[#FFFAF3] flex flex-col items-center justify-center p-8 text-center overflow-hidden relative">
        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 p-20 opacity-5">
          <ShoppingBag className="w-96 h-96 text-primary rotate-12" />
        </div>
        
        <div className="relative z-10 max-w-lg space-y-12">
          <div className="w-24 h-24 bg-orange-gradient rounded-[2.5rem] flex items-center justify-center mx-auto shadow-3xl transform rotate-12">
            <ShoppingBag className="w-12 h-12 text-white" />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-black font-headline tracking-tighter uppercase leading-none">
              Exclusive <span className="text-primary italic">Mobile</span> <br /> Experience
            </h1>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              Savora is a premium food-tech platform optimized for on-the-go lifestyle. Please open this link on your mobile or tablet.
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
              <div className="p-4 bg-white rounded-2xl shadow-xl border border-primary/10">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <div className="p-4 bg-white rounded-2xl shadow-xl border border-primary/10">
                <Tablet className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            
            <div className="p-1 bg-secondary/50 rounded-2xl border flex items-center gap-3 pr-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <MonitorOff className="w-5 h-5 text-destructive" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">PC Access Restricted</span>
            </div>
          </div>

          <div className="pt-8 border-t border-dashed">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">
              Savora Premium • 2025
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
