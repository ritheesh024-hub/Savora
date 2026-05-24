"use client"
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="rounded-full w-10 h-10 transition-all"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-500" />
      )}
    </Button>
  );
};