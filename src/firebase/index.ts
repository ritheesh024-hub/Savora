'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * IDEMPOTENT FIREBASE INITIALIZATION
 * Uses the getApps() registry to ensure singleton behavior 
 * across Next.js reloads and hydration.
 */

declare global {
  var __FIREBASE_APP__: FirebaseApp | undefined;
  var __FIREBASE_DB__: Firestore | undefined;
  var __FIREBASE_AUTH__: Auth | undefined;
}

export function initializeFirebase(): { 
  app: FirebaseApp | null; 
  db: Firestore | null; 
  auth: Auth | null;
} {
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }

  try {
    // 1. Initialize or retrieve the App
    let app: FirebaseApp;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      globalThis.__FIREBASE_APP__ = app;
    } else {
      app = getApp();
    }

    // 2. Initialize or retrieve Firestore
    if (!globalThis.__FIREBASE_DB__) {
      globalThis.__FIREBASE_DB__ = getFirestore(app);
    }

    // 3. Initialize or retrieve Auth
    if (!globalThis.__FIREBASE_AUTH__) {
      globalThis.__FIREBASE_AUTH__ = getAuth(app);
    }
    
    return { 
      app: app, 
      db: globalThis.__FIREBASE_DB__, 
      auth: globalThis.__FIREBASE_AUTH__
    };
  } catch (error) {
    console.error('Firebase Critical Init Error:', error);
    return { app: null, db: null, auth: null };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './error-emitter';
export * from './errors';
