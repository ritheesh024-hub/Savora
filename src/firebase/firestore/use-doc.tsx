'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

/**
 * Robust hook for real-time Firestore document streams.
 * Ensures strict cleanup and stability against Next.js re-renders.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const activePathRef = useRef<string>('');

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    if (activePathRef.current === docRef.path) return;
    activePathRef.current = docRef.path;

    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setData(snapshot.data() || null);
        setLoading(false);
        setError(null);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
        setError(serverError);
        setLoading(false);
      }
    );

    // CRITICAL: Unsubscribe on unmount or when reference changes
    return () => {
      unsubscribe();
      activePathRef.current = '';
    };
  }, [docRef?.path]);

  return { data, loading, error };
}
