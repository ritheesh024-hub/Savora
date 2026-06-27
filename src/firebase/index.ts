'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * HARDENED FIREBASE SINGLETON v6.5
 * Includes Null-Safe initialization and resilient offline persistence.
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
    if (window.__EZZY_FIREBASE_STATION__ && window.__EZZY_FIREBASE_STATION__.app) {
      return window.__EZZY_FIREBASE_STATION__;
    }

    // Integrity Check: Ensure API key is valid before initialization
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('...')) {
      console.warn('⚠️ [Ezzy Ops] Handshake Aborted: Placeholder or missing API key detected.');
      return { app: null, db: null, auth: null };
    }

    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    // Enable Offline Persistence for a seamless PWA experience
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ [Ezzy PWA] Persistence Conflict: Multi-tab restriction active.');
      }
    });

    const instances = { app, db, auth };
    window.__EZZY_FIREBASE_STATION__ = instances;
    
    return instances;
  } catch (error) {
    console.error('🔥 [Ezzy Ops] Connection Error:', error);
    return { app: null, db: null, auth: null };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './error-emitter';
export * from './errors';
