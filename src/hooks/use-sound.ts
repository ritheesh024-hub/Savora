'use client';

import { useCallback, useRef } from 'react';
import { useStore } from '@/app/lib/store';

const SOUNDS = {
  // New order trill: A unique, professional digital alert for high-end hospitality
  ping: 'https://assets.mixkit.co/active_storage/sfx/1351/1351-preview.mp3', 
  // Status updated: Clean high-pitched digital tick
  success: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 
  // Menu/Inventory updated: Light interface pop
  pop: 'https://assets.mixkit.co/active_storage/sfx/1111/1111-preview.mp3', 
  // Action failed: Soft electronic alert
  warning: 'https://assets.mixkit.co/active_storage/sfx/2511/2511-preview.mp3', 
};

export type SoundType = keyof typeof SOUNDS;

export function useSound() {
  const { isAdminMuted, toggleAdminMute } = useStore();
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const playSound = useCallback((type: SoundType) => {
    // Prevent playback on server or if muted
    if (typeof window === 'undefined' || isAdminMuted) return;

    try {
      // Lazy initialize audio elements
      if (!audioRefs.current[type]) {
        audioRefs.current[type] = new Audio(SOUNDS[type]);
      }

      const audio = audioRefs.current[type];
      audio.volume = 0.6; // Optimized volume for professional environments
      
      // Reset to start in case it's already playing
      audio.currentTime = 0;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Auto-play prevented. User interaction (click) needed.
          console.warn(`Audio playback for "${type}" was blocked by browser. Interaction required.`, error);
        });
      }
    } catch (e) {
      console.warn(`Failed to initialize audio for "${type}":`, e);
    }
  }, [isAdminMuted]);

  return { playSound, isAdminMuted, toggleAdminMute };
}
