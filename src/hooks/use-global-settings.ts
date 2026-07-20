'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

/**
 * @fileOverview Global Configuration Hook
 * Establishes a real-time listener to the 'global_settings/config' document.
 * This is the Single Source of Truth for the entire Savora ecosystem.
 */

export interface GlobalSettings {
  isOpen: boolean;
  deliveryActive: boolean;
  codEnabled: boolean;
  onlinePayEnabled: boolean;
  storeName: string;
  contactNumber: string;
  supportEmail: string;
  address: string;
  deliveryRadius: number;
  openTime: string;
  closeTime: string;
  minOrderValue: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  newOrderAlert: boolean;
  statusUpdates: boolean;
  productionUrl: string;
}

const DEFAULT_SETTINGS: GlobalSettings = {
  isOpen: true,
  deliveryActive: true,
  codEnabled: true,
  onlinePayEnabled: true,
  storeName: 'Savora',
  contactNumber: '8639366800',
  supportEmail: 'support@savora.com',
  address: 'Near Anurag University, Pocharam, Hyderabad',
  deliveryRadius: 3,
  openTime: '08:00',
  closeTime: '22:00',
  minOrderValue: 0,
  deliveryCharge: 40,
  freeDeliveryThreshold: 149,
  newOrderAlert: true,
  statusUpdates: true,
  productionUrl: ''
};

export function useGlobalSettings() {
  const db = useFirestore();
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const docRef = doc(db, 'global_settings', 'config');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...snapshot.data() });
        }
        setLoading(false);
      },
      (error) => {
        console.warn("Global settings listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db]);

  return { settings, loading };
}
