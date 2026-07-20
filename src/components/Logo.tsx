'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean;
}

export const Logo = ({ className, variant = 'color', size = 'md', hideText = false }: LogoProps) => {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', iconContainer: 'w-9 h-9 rounded-xl' },
    md: { icon: 'w-10 h-10', text: 'text-3xl', iconContainer: 'w-14 h-14 rounded-2xl' },
    lg: { icon: 'w-14 h-14', text: 'text-5xl', iconContainer: 'w-20 h-20 rounded-3xl' }
  };

  const colors = {
    light: 'text-white',
    dark: 'text-foreground',
    color: 'text-foreground'
  };

  return (
    <div className={cn("flex items-center gap-3 md:gap-5 group select-none relative", className)}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className={cn(
        "flex items-center justify-center bg-orange-gradient transform group-hover:rotate-12 transition-all duration-500 shadow-2xl shadow-primary/30 relative z-10",
        sizes[size].iconContainer
      )}>
        <ShoppingBag className={cn("text-white", sizes[size].icon)} />
      </div>
      {!hideText && (
        <span className={cn(
          "font-headline font-black tracking-tighter leading-none transition-colors duration-500 relative z-10",
          colors[variant],
          sizes[size].text
        )}>
          Savora
        </span>
      )}
    </div>
  );
};
