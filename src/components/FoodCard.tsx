"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Plus, Minus, Heart, Zap } from 'lucide-react';
import { FoodItem, useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { BeverageCustomizer } from './BeverageCustomizer';
import { useAnalytics } from '@/hooks/use-analytics';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { AuthModal } from './AuthModal';
import { ProductDetails } from './ProductDetails';

interface FoodCardProps {
  item: FoodItem;
}

export const FoodCard = ({ item }: FoodCardProps) => {
  const { cart, addToCart, updateQuantity } = useStore();
  const { user } = useUser();
  const db = useFirestore();
  const [isCustomizing, setIsCustomizing] = useState(false);
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
    } else {
      addToCart(item);
      trackAddToCart(item);
      toast({ title: "Added to Tray" });
    }
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

  return (
    <>
      <div 
        onClick={() => setIsDetailsOpen(true)}
        className="group bg-white dark:bg-zinc-900 rounded-[1.8rem] border border-border/30 hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full relative cursor-pointer active:scale-[0.98] shadow-sm hover:border-primary/20"
      >
        {/* IMAGE SECTION */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary/30">
          <Image 
            src={item.imageUrl} 
            alt={item.name} 
            fill 
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover group-hover:scale-110 transition-transform duration-1000" 
            unoptimized 
            loading="lazy"
          />
          
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
             <div className={cn(
               "w-4 h-4 bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-lg border flex items-center justify-center shadow-lg",
               item.isVeg ? "border-green-500" : "border-red-500"
             )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", item.isVeg ? "bg-green-500" : "bg-red-500")} />
            </div>
            
            <Badge className="bg-white/95 dark:bg-black/95 text-foreground border-none font-black px-2 py-1 rounded-lg flex items-center gap-1.5 text-[9px] shadow-lg">
              <Star className="w-2.5 h-2.5 fill-primary text-primary" />
              {displayRating}
            </Badge>
          </div>

          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <button 
              type="button"
              onClick={toggleFavorite}
              className="w-9 h-9 rounded-full bg-white/95 dark:bg-black/95 backdrop-blur-xl flex items-center justify-center shadow-xl active:scale-75 transition-all"
            >
              <Heart className={cn("w-4.5 h-4.5", isFavorited ? "fill-primary text-primary" : "text-muted-foreground")} />
            </button>
            {item.isPopular && (
              <div className="w-9 h-9 rounded-full bg-orange-gradient flex items-center justify-center shadow-xl">
                 <Zap className="w-4.5 h-4.5 text-white fill-current" />
              </div>
            )}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* CONTENT SECTION */}
        <div className="flex-1 flex flex-col p-5 min-w-0">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1.5">
               <p className="text-[8px] font-black uppercase text-primary/40 tracking-[0.3em]">{item.category}</p>
            </div>
            <h3 className="text-base md:text-lg font-black uppercase tracking-tighter leading-tight line-clamp-1 mb-1 italic">
              {item.name}
            </h3>
            <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 opacity-60 font-medium mb-4 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto gap-4">
            <div className="flex flex-col">
               <span className="text-[8px] font-black uppercase opacity-30 tracking-widest leading-none mb-0.5">Price Node</span>
               <span className="text-lg md:text-2xl font-black text-primary italic leading-none">₹{item.price}</span>
            </div>

            <div className="shrink-0">
              {cartItemCount > 0 ? (
                <div className="flex items-center gap-2 bg-primary text-white rounded-[1.2rem] h-11 md:h-12 px-2 shadow-2xl">
                  <button type="button" onClick={(e) => handleQtyChange(e, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="text-sm font-black w-6 text-center">{cartItemCount}</span>
                  <button type="button" onClick={(e) => handleQtyChange(e, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              ) : (
                <Button 
                  type="button"
                  onClick={handleAddClick} 
                  className="rounded-[1.2rem] h-11 md:h-12 px-6 md:px-8 font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] bg-secondary/50 text-foreground border-none hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95 group/btn"
                >
                  ADD <Plus className="ml-2 w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {(item.isBeverage || item.isCustomizable) && (
        <BeverageCustomizer item={item} isOpen={isCustomizing} onClose={() => setIsCustomizing(false)} onConfirm={(opts) => { addToCart(item, opts); setIsCustomizing(false); }} />
      )}
      
      <ProductDetails item={item} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} onAddToCart={() => { setIsDetailsOpen(false); addToCart(item); }} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
