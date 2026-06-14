'use client';

import { useCallback } from 'react';
import { logEvent } from 'firebase/analytics';
import { useAnalyticsInstance } from '@/firebase/provider';
import { FoodItem } from '@/app/lib/store';

/**
 * Custom hook for high-level Firebase Analytics event tracking.
 */
export function useAnalytics() {
  const analytics = useAnalyticsInstance();

  const trackEvent = useCallback((eventName: string, params?: object) => {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  }, [analytics]);

  const trackAppOpen = useCallback(() => {
    trackEvent('app_open');
  }, [trackEvent]);

  const trackLogin = useCallback((method: string = 'google') => {
    trackEvent('login', { method });
  }, [trackEvent]);

  const trackSignup = useCallback((method: string = 'google') => {
    trackEvent('sign_up', { method });
  }, [trackEvent]);

  const trackAddToCart = useCallback((item: FoodItem, quantity: number = 1) => {
    trackEvent('add_to_cart', {
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: quantity
      }],
      value: item.price * quantity,
      currency: 'INR'
    });
  }, [trackEvent]);

  const trackCheckoutStarted = useCallback((cart: any[], total: number) => {
    trackEvent('begin_checkout', {
      items: cart.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity
      })),
      value: total,
      currency: 'INR'
    });
  }, [trackEvent]);

  const trackOrderPlaced = useCallback((order: any) => {
    trackEvent('purchase', {
      transaction_id: order.orderId,
      value: order.total,
      currency: 'INR',
      items: order.items.map((item: any) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }, [trackEvent]);

  const trackOrderCancelled = useCallback((orderId: string, reason: string = 'customer_request') => {
    trackEvent('order_cancelled', {
      order_id: orderId,
      reason: reason
    });
  }, [trackEvent]);

  const trackSearch = useCallback((searchTerm: string) => {
    trackEvent('search', { search_term: searchTerm });
  }, [trackEvent]);

  const trackCategoryView = useCallback((category: string) => {
    trackEvent('category_view', { category_name: category });
  }, [trackEvent]);

  const trackProductView = useCallback((item: FoodItem) => {
    trackEvent('view_item', {
      items: [{
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price
      }]
    });
  }, [trackEvent]);

  const trackMenuView = useCallback(() => {
    trackEvent('menu_view');
  }, [trackEvent]);

  return {
    trackEvent,
    trackAppOpen,
    trackLogin,
    trackSignup,
    trackAddToCart,
    trackCheckoutStarted,
    trackOrderPlaced,
    trackOrderCancelled,
    trackSearch,
    trackCategoryView,
    trackProductView,
    trackMenuView
  };
}
