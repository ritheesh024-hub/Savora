'use client';

import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { useStore } from '@/app/lib/store';
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<{
    app: any;
    db: any;
    auth: any;
  }>({ app: null, db: null, auth: null });

  const { isDarkMode } = useStore();
  const initRef = useRef(false);

  // 1. Initialize Firebase strictly ONCE after browser mount
  useEffect(() => {
    setMounted(true);
    if (initRef.current) return;
    initRef.current = true;
    
    try {
      const initialized = initializeFirebase();
      setServices(initialized);
    } catch (e) {
      console.error("Firebase Provider Boot Failure:", e);
    }
  }, []);

  // 2. Handle theme syncing independently
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // CRITICAL: Handle missing Firebase configuration gracefully with a diagnostic UI
  if (!services.app) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 rounded-[2.5rem] flex items-center justify-center text-rose-600 mb-8 shadow-inner animate-in zoom-in-95">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-black font-headline uppercase tracking-tighter italic leading-none">
            Registry <span className="text-rose-600">Offline</span>
          </h1>
          <p className="text-xs font-bold text-muted-foreground leading-relaxed uppercase tracking-tight opacity-70">
            The application protocol could not establish a handshake with Firebase. This usually indicates that the environment variables in .env are missing or the API keys are invalid.
          </p>
          <div className="pt-8 flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full h-14 bg-zinc-950 dark:bg-white dark:text-black text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-transform"
            >
              Retry Handshake
            </button>
            <p className="text-[8px] font-black uppercase opacity-30 tracking-[0.4em]">Error Node: auth/invalid-api-key</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider 
      app={services.app} 
      db={services.db} 
      auth={services.auth}
    >
      {children}
    </FirebaseProvider>
  );
}
