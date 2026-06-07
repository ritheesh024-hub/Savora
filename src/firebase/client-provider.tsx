'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { useStore } from '@/app/lib/store';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // Initialize services immediately to avoid startup loading screen
  const [services] = useState(() => initializeFirebase());
  const { isDarkMode } = useStore();

  // Sync dark mode class on mount and when state changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  // Provide initialized services or nulls if they fail (fail gracefully)
  return (
    <FirebaseProvider 
      app={services.app as FirebaseApp} 
      db={services.db as Firestore} 
      auth={services.auth as Auth}
    >
      {children}
    </FirebaseProvider>
  );
}
