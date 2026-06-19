'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

/**
 * Robust hook for real-time Firestore collection streams.
 * Ensures strict cleanup and stability against Next.js re-renders.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use a ref to track the current active query to prevent race conditions during Fast Refresh
  const activeQueryRef = useRef<string>('');

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    // Generate a unique fingerprint for the query (path + constraints)
    // This is more reliable than just the path string
    const queryFingerprint = JSON.stringify((query as any)._query || query);
    
    if (activeQueryRef.current === queryFingerprint) return;
    activeQueryRef.current = queryFingerprint;

    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const items = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(items);
        setLoading(false);
        setError(null);
      },
      async (serverError) => {
        const queryPath = (query as any)?._query?.path?.toString() || 'unknown collection';
        const permissionError = new FirestorePermissionError({
          path: queryPath,
          operation: 'list',
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
        setError(serverError);
        setLoading(false);
      }
    );

    // CRITICAL: Unsubscribe on unmount or when query changes
    return () => {
      unsubscribe();
      activeQueryRef.current = '';
    };
  }, [query]); // Calling components MUST memoize the query object

  return { data, loading, error };
}
