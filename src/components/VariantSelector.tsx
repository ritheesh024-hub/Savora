
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FoodItem, ProductVariant } from '@/app/lib/store';
import { ShoppingBag, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  item: FoodItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (variant: ProductVariant) => void;
}

export const VariantSelector = ({ item, isOpen, onClose, onConfirm }: VariantSelectorProps) => {
  const availableVariants = item.variants?.filter(v => v.isAvailable) || [];
  const [selectedId, setSelectedId] = useState<string>(availableVariants[0]?.id || '');

  const selectedVariant = item.variants?.find(v => v.id === selectedId);

  if (!item.variants || item.variants.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-4xl bg-white dark:bg-zinc-950 animate-in zoom-in-95 duration-300">
        <div className="bg-primary p-8 text-white relative overflow-hidden shrink-0">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <DialogHeader>
            <DialogTitle className="text-3xl font-black font-headline uppercase tracking-tighter italic relative z-10 flex items-center gap-3">
              Choose <span className="opacity-80">Size</span>
            </DialogTitle>
            <DialogDescription className="text-white/70 font-bold text-[10px] uppercase tracking-widest relative z-10 mt-1">
              {item.name} — Premium Selection
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">Available Portions</p>
          
          <RadioGroup value={selectedId} onValueChange={setSelectedId} className="space-y-3">
            {item.variants.map((variant) => (
              <Label
                key={variant.id}
                htmlFor={variant.id}
                className={cn(
                  "flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer group",
                  !variant.isAvailable ? "opacity-40 grayscale cursor-not-allowed border-dashed" : 
                  selectedId === variant.id ? "border-primary bg-primary/5 shadow-lg" : "border-muted hover:border-primary/20"
                )}
              >
                <div className="flex items-center gap-4">
                  <RadioGroupItem value={variant.id} id={variant.id} className="sr-only" disabled={!variant.isAvailable} />
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedId === variant.id ? "border-primary bg-primary" : "border-muted"
                  )}>
                    {selectedId === variant.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h4 className={cn("font-black text-sm uppercase tracking-tight", selectedId === variant.id ? "text-primary" : "text-foreground")}>
                      {variant.name}
                    </h4>
                    {!variant.isAvailable && <p className="text-[7px] font-black uppercase text-rose-500">Out of Stock</p>}
                  </div>
                </div>
                <div className="text-right">
                   <p className="font-black text-lg italic text-primary leading-none">₹{variant.price}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="p-8 bg-zinc-50 dark:bg-zinc-900 border-t shrink-0">
          <Button 
            disabled={!selectedVariant || !selectedVariant.isAvailable}
            onClick={() => selectedVariant && onConfirm(selectedVariant)}
            className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] bg-primary text-white shadow-2xl shadow-primary/30 gap-3 group"
          >
            Confirm Selection <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
