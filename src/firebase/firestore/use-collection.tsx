
'use client';

import { useState, useEffect, useRef } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '../errors';

/**
 * STABILIZED COLLECTION HOOK v3.0
 * Prevents Firestore ID: ca9 assertion errors by strictly managing 
 * listener lifecycle and ensuring only one active subscription per query path.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const activeQueryRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Identity Node Fingerprint
    // We create a stable key to check if the query context has truly changed
    let currentKey = 'null';
    try {
      if (query) {
        // We use the query's string representation as a stable identity key
        currentKey = (query as any)._query?.path?.toString() || JSON.stringify((query as any)._query) || 'active';
      }
    } catch (e) {
      currentKey = 'query-node';
    }

    if (currentKey === activeQueryRef.current && currentKey !== 'null') {
      return; 
    }
    
    activeQueryRef.current = currentKey;

    // 2. Clean teardown of previous listener node
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!query || typeof window === 'undefined') {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 3. SETTLE-DELAY (150ms)
    // Critical guard for Next.js HMR and rapid navigation transitions.
    // Gives the Firestore internal state machine time to clear previous signals.
    const timeoutId = setTimeout(() => {
      try {
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
          async (serverError: any) => {
            // Enhanced Error Dispatch
            if (serverError.code === 'permission-denied') {
              const permissionError = new FirestorePermissionError({
                path: 'registry_collection',
                operation: 'list',
              } satisfies SecurityRuleContext);

              errorEmitter.emit('permission-error', permissionError);
            }
            
            console.warn("⚠️ [Ezzy Flux] Firestore Node Error:", serverError.message);
            setError(serverError);
            setLoading(false);
          }
        );

        unsubscribeRef.current = unsubscribe;
      } catch (err: any) {
        console.error("🔥 [Ezzy Flux] Critical Sync Failure:", err);
        setError(err);
        setLoading(false);
      }
    }, 150); 

    return () => {
      clearTimeout(timeoutId);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [query]); 

  return { data, loading, error };
}
