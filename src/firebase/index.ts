'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getMessaging, Messaging, isSupported as isMessagingSupported } from 'firebase/messaging';
import { firebaseConfig } from './config';

// Singleton instances to prevent multiple initializations and assertion errors
let firebaseApp: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let firebaseAuth: Auth | undefined;
let firebaseMessaging: Messaging | null = null;

/**
 * Initializes Firebase services safely on the client side only.
 * Note: Analytics is initialized asynchronously in the provider.
 */
export function initializeFirebase(): { 
  app: FirebaseApp | null; 
  db: Firestore | null; 
  auth: Auth | null;
  messaging: Messaging | null;
} {
  // Ensure Firebase is only initialized on the client to avoid SSR assertion errors
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null, messaging: null };
  }

  // Check if config has been updated from defaults
  const isConfigValid = 
    firebaseConfig.apiKey && 
    !firebaseConfig.apiKey.includes('your_');

  if (!isConfigValid) {
    return { app: null, db: null, auth: null, messaging: null };
  }

  try {
    if (!firebaseApp) {
      firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      firestore = getFirestore(firebaseApp);
      firebaseAuth = getAuth(firebaseApp);
      
      // Messaging is client-only and environment dependent
      isMessagingSupported().then(supported => {
        if (supported && firebaseApp) {
          firebaseMessaging = getMessaging(firebaseApp);
        }
      });
    }
    
    return { 
      app: firebaseApp, 
      db: firestore!, 
      auth: firebaseAuth!, 
      messaging: firebaseMessaging 
    };
  } catch (error) {
    console.error('Failed to initialize Firebase services:', error);
    return { app: null, db: null, auth: null, messaging: null };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './error-emitter';
export * from './errors';
