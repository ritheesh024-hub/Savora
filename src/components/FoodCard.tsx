
"use client"
import React from 'react';
import Image from 'next/image';
import { Star, Heart, Plus, Minus, Clock, Sparkles } from 'lucide-react';
import { FoodItem, useStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const FoodCard = ({ item }: { item: FoodItem }) => {
  const { cart, addToCart, updateQuantity } = useStore();
  
  const cartItem = cart.find(i => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addToCart(item);
    toast({
      title: "Added to cart",
      description: `${item.name} is ready for checkout.`,
    });
  };

  return (
    <div className="group bg-card rounded-[32px] border border-border/50 overflow-hidden hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col h-full shadow-sm relative">
      {/* Best Seller Badge */}
      {item.rating >= 4.7 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-primary text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-primary/30">
          <Sparkles className="w-3 h-3" /> Best Seller
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Image 
          src={item.imageUrl} 
          alt={item.name} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-1000"
          unoptimized={item.imageUrl.startsWith('http')}
        />
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {item.isVeg ? (
            <div className="bg-white/90 backdrop-blur px-2 py-2 rounded-xl border border-green-500 shadow-xl">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur px-2 py-2 rounded-xl border border-red-500 shadow-xl">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
          )}
        </div>
        
        <button className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/90 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 active:scale-95 transition-all z-10 shadow-lg shadow-black/5">
          <Heart className="w-5 h-5" />
        </button>

        <div className="absolute bottom-4 left-4 z-10">
          <Badge className="bg-white/90 backdrop-blur text-foreground border shadow-lg font-black flex items-center gap-1 px-3 py-1 rounded-xl">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {item.rating}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="text-lg md:text-2xl font-black line-clamp-1 group-hover:text-primary transition-colors tracking-tight leading-tight">{item.name}</h3>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-2 min-h-[2.5rem] leading-relaxed font-medium opacity-80">
            {item.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-[10px] text-muted-foreground mb-6 uppercase tracking-widest font-black opacity-60">
          <span className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> 20-30 MINS
          </span>
          <span className="flex items-center gap-2 text-primary">
            <Sparkles className="w-3.5 h-3.5" /> 10% OFF
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-headline font-black text-primary leading-none">₹{item.price}</span>
            <span className="text-xs text-muted-foreground line-through opacity-40 mt-1 font-bold">₹{Math.round(item.price * 1.1)}</span>
          </div>

          {quantity === 0 ? (
            <Button 
              onClick={handleAdd}
              size="lg"
              className="rounded-2xl px-8 h-12 md:h-14 font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 group/btn"
            >
              Add
              <Plus className="w-4 h-4 ml-2 transition-transform group-hover/btn:rotate-90" />
            </Button>
          ) : (
            <div className="flex items-center bg-primary text-primary-foreground rounded-2xl h-12 md:h-14 px-2 shadow-2xl shadow-primary/30 overflow-hidden animate-in zoom-in duration-300">
              <button 
                onClick={() => updateQuantity(item.id, -1)}
                className="w-10 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-lg font-black">{quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, 1)}
                className="w-10 h-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
