'use client';

import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { useStore } from '@/app/lib/store';
import { Loader2, AlertCircle } from 'lucide-react';

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
    
    const initialized = initializeFirebase();
    setServices(initialized);
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

  // CRITICAL: Handle missing Firebase configuration gracefully
  if (!services.app) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/20 rounded-[2.5rem] flex items-center justify-center text-rose-600 mb-8 shadow-inner animate-in zoom-in-95">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-black font-headline uppercase tracking-tighter italic">
            Connection <span className="text-rose-600">Refused</span>
          </h1>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed uppercase tracking-tight opacity-70">
            The application registry is currently empty. Please verify your environment variables (.env) and ensure your API keys are correctly provisioned in the console.
          </p>
          <div className="pt-6">
            <button 
              onClick={() => window.location.reload()}
              className="px-8 h-12 bg-zinc-950 dark:bg-white dark:text-black text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:scale-105 transition-transform"
            >
              Retry Handshake
            </button>
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
