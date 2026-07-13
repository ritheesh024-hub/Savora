
"use client"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderType = 'Dine-In' | 'Take Away' | 'Delivery';

export interface BeverageOptions {
  size: 'Small' | 'Medium' | 'Large';
  sugar: 'None' | 'Less' | 'Regular' | 'Extra';
  temp: 'Hot' | 'Cold';
  addons: string[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  isAvailable: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  imageUrl: string;
  isVeg: boolean;
  rating: number;
  ratingSum?: number;
  reviewCount?: number;
  isAvailable: boolean;
  isBeverage?: boolean;
  isCustomizable?: boolean;
  isBestSeller?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  spiceLevel?: 'None' | 'Mild' | 'Medium' | 'Hot' | 'Extra Hot';
  prepTime?: number;
  createdAt?: any;
  hasVariants?: boolean;
  variants?: ProductVariant[];
}

export interface CartItem extends FoodItem {
  quantity: number;
  customization?: BeverageOptions;
  selectedVariant?: ProductVariant;
  cartId: string;
}

interface AppStore {
  cart: CartItem[];
  isAdminMuted: boolean;
  menuViewMode: 'small' | 'big';
  isDarkMode: boolean;
  selectedOrderType: OrderType | null;
  addToCart: (item: FoodItem, customization?: BeverageOptions, variant?: ProductVariant) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, delta: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  toggleAdminMute: () => void;
  setMenuViewMode: (mode: 'small' | 'big') => void;
  toggleDarkMode: () => void;
  setOrderType: (type: OrderType | null) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      cart: [],
      isAdminMuted: false,
      menuViewMode: 'big',
      isDarkMode: false,
      selectedOrderType: null,
      addToCart: (item, customization, variant) => set((state) => {
        let cartId = item.id;
        
        if (variant) {
          cartId = `${item.id}-v-${variant.id}`;
        } else if (customization) {
          cartId = `${item.id}-${customization.size}-${customization.temp}-${customization.sugar}-${customization.addons.sort().join(',')}`;
        }

        const existing = state.cart.find((i) => i.cartId === cartId);
        
        if (existing) {
          return {
            cart: state.cart.map((i) => 
              i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
            )
          };
        }

        let finalPrice = variant ? variant.price : item.price;
        
        if (customization) {
          if (customization.size === 'Medium') finalPrice += 20;
          if (customization.size === 'Large') finalPrice += 40;
          finalPrice += customization.addons.length * 15;
        }

        return { 
          cart: [...state.cart, { ...item, price: finalPrice, quantity: 1, customization, selectedVariant: variant, cartId }] 
        };
      }),
      removeFromCart: (cartId) => set((state) => ({
        cart: state.cart.filter((i) => i.cartId !== cartId)
      })),
      updateQuantity: (cartId, delta) => set((state) => ({
        cart: state.cart.map((i) => 
          i.cartId === cartId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
        ).filter(i => i.quantity > 0)
      })),
      clearCart: () => set({ cart: [] }),
      getTotal: () => get().cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
      toggleAdminMute: () => set((state) => ({ isAdminMuted: !state.isAdminMuted })),
      setMenuViewMode: (mode) => set({ menuViewMode: mode }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setOrderType: (type) => set({ selectedOrderType: type }),
    }),
    { name: 'ezzy-bites-operational-storage' }
  )
);
