'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// Singleton instances to prevent multiple initializations and assertion errors
let firebaseApp: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let firebaseAuth: Auth | undefined;

/**
 * Initializes Firebase services safely on the client side only.
 * This is defensive against Next.js SSR and Hot Module Replacement.
 */
export function initializeFirebase(): { 
  app: FirebaseApp | null; 
  db: Firestore | null; 
  auth: Auth | null;
} {
  // Ensure Firebase is only initialized on the client to avoid SSR assertion errors
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }

  // Check if config is valid
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your_')) {
    console.warn('Firebase configuration is missing or invalid.');
    return { app: null, db: null, auth: null };
  }

  try {
    // Standard singleton pattern for Next.js Client Components
    if (!firebaseApp) {
      firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    }

    if (!firestore) {
      firestore = getFirestore(firebaseApp);
    }

    if (!firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp);
    }
    
    return { 
      app: firebaseApp, 
      db: firestore, 
      auth: firebaseAuth
    };
  } catch (error) {
    console.error('Failed to initialize Firebase services:', error);
    return { app: null, db: null, auth: null };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './error-emitter';
export * from './errors';
