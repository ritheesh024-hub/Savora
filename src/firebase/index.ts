'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// Module-level singletons to maintain state across HMR and navigation
let firebaseApp: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let firebaseAuth: Auth | undefined;

/**
 * Initializes Firebase services safely on the client side only.
 * Uses a defensive singleton pattern to prevent multiple initializations.
 */
export function initializeFirebase(): { 
  app: FirebaseApp | null; 
  db: Firestore | null; 
  auth: Auth | null;
} {
  // 1. Strict Server Guard: Firebase Client SDK should never run on the server
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }

  try {
    // 2. App Singleton: Use existing app if available
    if (!firebaseApp) {
      firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    }

    // 3. Service Singletons: Re-using existing instances is critical to prevent "Unexpected state" errors
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
    console.error('Firebase Initialization Error:', error);
    return { app: null, db: null, auth: null };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './error-emitter';
export * from './errors';
