
"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Plus, Minus, Heart, Zap } from 'lucide-react';
import { FoodItem, useStore, ProductVariant } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { BeverageCustomizer } from './BeverageCustomizer';
import { VariantSelector } from './VariantSelector';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { AuthModal } from './AuthModal';
import { ProductDetails } from './ProductDetails';

interface FoodCardProps {
  item: FoodItem;
  variant?: 'card' | 'list';
}

const VegIcon = ({ isVeg }: { isVeg: boolean }) => (
  <div className={cn(
    "w-4 h-4 border-2 flex items-center justify-center rounded-[4px] shrink-0",
    isVeg ? "border-green-600" : "border-red-600"
  )}>
    <div className={cn("w-1.5 h-1.5 rounded-full", isVeg ? "bg-green-600" : "bg-red-600")} />
  </div>
);

export const FoodCard = ({ item, variant = 'card' }: FoodCardProps) => {
  const { cart, addToCart, updateQuantity } = useStore();
  const { user } = useUser();
  const db = useFirestore();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isSelectingVariant, setIsSelectingVariant] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { trackProductView, trackAddToCart, trackEvent } = useAnalytics();
  
  const cartItemCount = cart.filter(i => i.id === item.id).reduce((acc, i) => acc + i.quantity, 0);

  // Favorites logic
  const favDocId = user ? `${user.uid}_${item.id}` : null;
  const favRef = (db && favDocId) ? doc(db, 'favorites', favDocId) : null;
  const { data: favoriteData } = useDoc<any>(favRef);
  const isFavorited = !!favoriteData;

  useEffect(() => {
    trackProductView(item);
  }, [item, trackProductView]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!db || !favRef) return;

    if (isFavorited) {
      await deleteDoc(favRef);
      trackEvent('remove_from_wishlist', { item_id: item.id, item_name: item.name });
    } else {
      await setDoc(favRef, {
        userId: user.uid,
        productId: item.id,
        product: item,
        createdAt: serverTimestamp()
      });
      trackEvent('add_to_wishlist', { item_id: item.id, item_name: item.name });
      toast({ title: "Saved to Favorites" });
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.isBeverage || item.isCustomizable) {
      setIsCustomizing(true);
    } else if (item.hasVariants && item.variants && item.variants.length > 0) {
      setIsSelectingVariant(true);
    } else {
      addToCart(item);
      trackAddToCart(item);
      toast({ title: "Added to Tray" });
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    addToCart(item, undefined, variant);
    trackAddToCart(item);
    setIsSelectingVariant(false);
    toast({ title: `Added ${variant.name} to Tray` });
  };

  const handleQtyChange = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    const targetItem = cart.find(i => i.id === item.id);
    if (targetItem) {
      updateQuantity(targetItem.cartId, delta);
    } else if (delta > 0) {
      handleAddClick(e);
    }
  };

  const displayRating = item.reviewCount 
    ? (item.ratingSum! / item.reviewCount).toFixed(1) 
    : (item.rating || '4.5');

  if (variant === 'list') {
    return (
      <>
        <div 
          onClick={() => setIsDetailsOpen(true)}
          className="flex justify-between py-10 gap-6 group cursor-pointer border-b border-zinc-100 last:border-0"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <VegIcon isVeg={item.isVeg} />
              {item.isFeatured && <span className="text-[10px] font-black uppercase text-orange-500 flex items-center gap-1"><Zap className="w-3 h-3 fill-current" /> Bestseller</span>}
            </div>
            <h3 className="text-lg md:text-xl font-black text-zinc-900 group-hover:text-primary transition-colors italic">{item.name}</h3>
            <p className="font-black text-zinc-900">₹{item.price}</p>
            <div className="flex items-center gap-1.5 text-xs text-green-700 font-black">
              <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded">
                <Star className="w-3 h-3 fill-current" /> {displayRating}
              </div>
              {item.reviewCount && <span className="text-zinc-400 font-bold">({item.reviewCount})</span>}
            </div>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-md line-clamp-2 italic">
              {item.description}
            </p>
          </div>

          <div className="relative shrink-0 flex flex-col items-center">
            <div className="relative w-32 h-32 md:w-44 md:h-40 rounded-2xl overflow-hidden shadow-xl bg-secondary/30">
              <Image 
                src={item.imageUrl} 
                alt={item.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
                unoptimized 
              />
            </div>
            
            <div className="absolute -bottom-3 w-[85%] max-w-[120px]">
              {cartItemCount > 0 ? (
                <div className="bg-white text-primary border border-zinc-200 shadow-2xl rounded-xl h-10 flex items-center justify-between px-2">
                  <button onClick={(e) => handleQtyChange(e, -1)} className="p-1.5 hover:bg-zinc-50 rounded-lg transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="font-black text-sm">{cartItemCount}</span>
                  <button onClick={(e) => handleQtyChange(e, 1)} className="p-1.5 hover:bg-zinc-50 rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <Button 
                  onClick={handleAddClick}
                  variant="outline"
                  className="w-full h-10 bg-white hover:bg-zinc-50 text-primary border border-zinc-200 shadow-2xl font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all"
                >
                  ADD
                </Button>
              )}
              {item.isCustomizable && <p className="text-[7px] font-black uppercase text-zinc-400 text-center mt-1.5 tracking-tighter">Customizable</p>}
            </div>
          </div>
        </div>

        {(item.isBeverage || item.isCustomizable) && (
          <BeverageCustomizer item={item} isOpen={isCustomizing} onClose={() => setIsCustomizing(false)} onConfirm={(opts) => { addToCart(item, opts); setIsCustomizing(false); }} />
        )}
        {item.hasVariants && (
          <VariantSelector item={item} isOpen={isSelectingVariant} onClose={() => setIsSelectingVariant(false)} onConfirm={handleVariantSelect} />
        )}
        <ProductDetails item={item} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} onAddToCart={() => { setIsDetailsOpen(false); handleAddClick({ stopPropagation: () => {} } as any); }} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <div 
        onClick={() => setIsDetailsOpen(true)}
        className="group bg-white dark:bg-zinc-900 rounded-[2rem] border border-border/30 hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full relative cursor-pointer active:scale-[0.98] shadow-sm hover:border-primary/20"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/30">
          <Image 
            src={item.imageUrl} 
            alt={item.name} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-1000" 
            unoptimized 
          />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
             <VegIcon isVeg={item.isVeg} />
          </div>

          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button 
              type="button"
              onClick={toggleFavorite}
              className="w-9 h-9 rounded-full bg-white/95 dark:bg-black/95 backdrop-blur-xl flex items-center justify-center shadow-xl active:scale-75 transition-all"
            >
              <Heart className={cn("w-4.5 h-4.5", isFavorited ? "fill-primary text-primary" : "text-muted-foreground")} />
            </button>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent flex justify-between items-end">
             <div className="bg-white/90 backdrop-blur px-2 py-0.5 rounded flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span className="text-[10px] font-black">{displayRating}</span>
             </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-5 min-w-0">
          <h3 className="text-base md:text-lg font-black uppercase tracking-tighter leading-tight line-clamp-1 mb-1 italic">
            {item.name}
          </h3>
          <div className="flex items-center justify-between mt-auto gap-4">
            <p className="text-lg md:text-xl font-black text-primary italic leading-none">₹{item.price}</p>
            <div className="shrink-0 relative">
              {cartItemCount > 0 ? (
                <div className="flex items-center gap-2 bg-primary text-white rounded-xl h-10 px-2 shadow-xl">
                  <button type="button" onClick={(e) => handleQtyChange(e, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="text-xs font-black w-5 text-center">{cartItemCount}</span>
                  <button type="button" onClick={(e) => handleQtyChange(e, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <Button 
                  type="button"
                  onClick={handleAddClick} 
                  className="rounded-xl h-10 px-6 font-black uppercase text-[10px] bg-white border border-zinc-200 text-primary shadow-lg hover:bg-zinc-50 active:scale-95 transition-all"
                >
                  ADD
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {(item.isBeverage || item.isCustomizable) && (
        <BeverageCustomizer item={item} isOpen={isCustomizing} onClose={() => setIsCustomizing(false)} onConfirm={(opts) => { addToCart(item, opts); setIsCustomizing(false); }} />
      )}

      {item.hasVariants && (
        <VariantSelector item={item} isOpen={isSelectingVariant} onClose={() => setIsSelectingVariant(false)} onConfirm={handleVariantSelect} />
      )}
      
      <ProductDetails item={item} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} onAddToCart={() => { setIsDetailsOpen(false); handleAddClick({ stopPropagation: () => {} } as any); }} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
