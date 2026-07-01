'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * HARDENED FIREBASE SINGLETON v7.0
 * Includes Null-Safe initialization and resilient offline persistence.
 * Prevents "invalid-api-key" crashes by validating config before service boot.
 */

interface FirebaseInstances {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
}

declare global {
  interface Window {
    __EZZY_FIREBASE_STATION__?: FirebaseInstances;
  }
}

export function initializeFirebase(): FirebaseInstances {
  if (typeof window === 'undefined') {
    return { app: null, db: null, auth: null };
  }

  try {
    // Return cached instances if already initialized
    if (window.__EZZY_FIREBASE_STATION__ && window.__EZZY_FIREBASE_STATION__.app) {
      return window.__EZZY_FIREBASE_STATION__;
    }

    // Integrity Check: Prevent initialization if API key is missing
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.length < 5) {
      console.warn('⚠️ [Ezzy Ops] Handshake Aborted: Missing or invalid API key.');
      return { app: null, db: null, auth: null };
    }

    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    // Enable Offline Persistence for a seamless PWA experience
    if (typeof window !== 'undefined') {
      enableMultiTabIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('⚠️ [Ezzy PWA] Persistence Conflict: Multi-tab restriction active.');
        } else if (err.code === 'unimplemented') {
          console.warn('⚠️ [Ezzy PWA] Persistence Unsupported: Browser environment restricted.');
        }
      });
    }

    const instances = { app, db, auth };
    window.__EZZY_FIREBASE_STATION__ = instances;
    
    return instances;
  } catch (error) {
    console.error('🔥 [Ezzy Ops] Firebase Boot Error:', error);
    return { app: null, db: null, auth: null };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './error-emitter';
export * from './errors';
