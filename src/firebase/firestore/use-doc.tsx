'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

/**
 * ATOMIC DOCUMENT HOOK v4.0
 * Guarantees loading state resolution and prevents listener overlap.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (!isMounted) return;
          setData(snapshot.data() || null);
          setError(null);
          setLoading(false);
        },
        (serverError: any) => {
          if (!isMounted) return;
          
          console.warn("⚠️ [Ezzy Flux] Firestore Doc Sync Interrupted:", {
            code: serverError.code,
            path: docRef.path
          });

          if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: docRef.path,
              operation: 'get',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
          }
          
          setError(serverError);
          setLoading(false); // CRITICAL: Stop loading even on error
        }
      );
    } catch (err: any) {
      if (isMounted) {
        setError(err);
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [docRef?.path]); 

  return { data, loading, error };
}
