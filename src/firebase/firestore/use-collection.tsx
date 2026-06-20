'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

/**
 * Robust hook for real-time Firestore collection streams.
 * Optimized to handle Next.js HMR and prevent "Unexpected state" errors.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query || typeof window === 'undefined') {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Standard listener with explicit cleanup
    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as T[];
        setData(items);
        setLoading(false);
        setError(null);
      },
      (serverError) => {
        // Attempt to extract path for context if available
        const queryPath = (query as any)._query?.path?.toString() || 'collection';
        const permissionError = new FirestorePermissionError({
          path: queryPath,
          operation: 'list',
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
        setError(serverError);
        setLoading(false);
      }
    );

    // Cleanup: Ensure the listener is closed before a new one starts or on unmount
    return () => unsubscribe();
  }, [query]); // Rely on the stable query reference (memoized by caller)

  return { data, loading, error };
}
