'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { useStore } from '@/app/lib/store';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // Initialize state with nulls to match server-side render
  const [services, setServices] = useState<{
    app: FirebaseApp | null;
    db: Firestore | null;
    auth: Auth | null;
  }>({ app: null, db: null, auth: null });

  const { isDarkMode } = useStore();

  // ONLY initialize Firebase once on mount. 
  // Do NOT include state dependencies that change frequently.
  useEffect(() => {
    const initialized = initializeFirebase();
    setServices(initialized);
  }, []);

  // Handle theme syncing separately to avoid re-initializing Firebase
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

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
