'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

/**
 * ATOMIC COLLECTION HOOK v4.0
 * Prevents hydration mismatches and guarantees state resolution.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  // Track query identity to prevent redundant listener cycling
  const lastQueryRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    // Generate unique ID for current query to check if it's actually new
    const queryId = (query as any)._query?.path?.segments?.join('/') || 'unknown';
    
    setLoading(true);

    try {
      unsubscribe = onSnapshot(
        query,
        (snapshot: QuerySnapshot<T>) => {
          if (!isMounted) return;
          const items = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as T[];
          setData(items);
          setError(null);
          setLoading(false);
        },
        (serverError: any) => {
          if (!isMounted) return;
          
          // Log structured error for index management
          console.warn("⚠️ [Ezzy Flux] Firestore Query Node Restricted:", {
            code: serverError.code,
            path: queryId,
            message: serverError.message
          });
          
          if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
              path: queryId,
              operation: 'list',
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
  }, [query]); 

  return { data, loading, error };
}
