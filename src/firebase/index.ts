import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services safely.
 */
export function initializeFirebase(): { 
  app: FirebaseApp | null; 
  db: Firestore | null; 
  auth: Auth | null;
  analytics: Analytics | null;
} {
  // Check if config has been updated from defaults
  const isConfigValid = 
    firebaseConfig.apiKey && 
    !firebaseConfig.apiKey.includes('your_');

  if (!isConfigValid) {
    console.warn('Firebase configuration is missing or incomplete.');
    return { app: null, db: null, auth: null, analytics: null };
  }

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);
    const auth = getAuth(app);
    
    let analytics: Analytics | null = null;
    if (typeof window !== 'undefined') {
      // Analytics is initialized asynchronously but we don't want to block
      isSupported().then(supported => {
        if (supported) analytics = getAnalytics(app);
      }).catch(err => console.warn("Analytics not supported", err));
    }

    return { app, db, auth, analytics };
  } catch (error) {
    console.error('Failed to initialize Firebase services:', error);
    return { app: null, db: null, auth: null, analytics: null };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-doc';
export * from './firestore/use-collection';
export * from './error-emitter';
export * from './errors';
