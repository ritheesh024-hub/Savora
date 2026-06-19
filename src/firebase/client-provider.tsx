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

  useEffect(() => {
    // This strictly runs on the client after hydration.
    // It prevents Firestore from being initialized in a Node.js context.
    const initialized = initializeFirebase();
    setServices(initialized);

    // Sync dark mode class
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Pass current services (will be null initially, then populated)
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
