'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, TicketPercent, Zap, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';

export const PromoBanner = () => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const offers = [
    {
      id: 'student',
      code: 'STUDENT10',
      title: 'Academic Special',
      description: 'FLAT 10 % OFF on all orders.',
      gradient: 'from-[#FF6B00] to-[#FF8A00]',
      highlight: 'Limited Epoch'
    },
    {
      id: 'new-user',
      code: 'EZZYBITES15',
      title: 'Midnight Cravings',
      description: '15 % OFF late-night meals.',
      gradient: 'from-[#6366F1] to-[#4F46E5]',
      highlight: 'Exclusive Hub'
    },
    {
      id: 'weekend',
      code: 'WEEKEND20',
      title: 'Weekend Bonanza',
      description: 'FLAT 20 % OFF this Sunday.',
      gradient: 'from-[#F43F5E] to-[#E11D48]',
      highlight: 'Bounty Plus'
    }
  ];

  const handleCopy = (code: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopied(code);
      toast({
        title: "Bounty Activated! 🚀",
        description: `Apply ${code} at checkout node.`,
      });
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="w-full relative">
      <Carousel
        opts={{ align: "center", loop: true }}
        plugins={[Autoplay({ delay: 5000 })]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {offers.map((offer) => (
            <CarouselItem key={offer.id} className="pl-0 basis-full">
              <div className="px-0">
                <div className={cn(
                  "relative w-full h-[140px] md:h-[180px] overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] transition-all duration-700 shadow-2xl border border-white/10 group",
                  "bg-gradient-to-br", offer.gradient
                )}>
                  {/* Decorative Elements */}
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute -left-10 -top-10 w-40 h-40 bg-black/5 rounded-full blur-2xl opacity-30 group-hover:scale-110 transition-transform duration-1000" />
                  
                  <div className="relative h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-16 z-10 gap-6">
                    <div className="space-y-2 md:space-y-4 text-center md:text-left flex-1 py-4">
                      <div className="flex flex-col md:flex-row items-center gap-3">
                         <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-3xl px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                            <Star className="w-3 h-3 text-white fill-current animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">{offer.highlight}</span>
                         </div>
                      </div>
                      
                      <h3 className="text-xl md:text-4xl font-black text-white leading-none uppercase tracking-tighter italic drop-shadow-2xl">
                        {offer.description}
                      </h3>
                      <p className="text-[10px] md:text-xs font-bold text-white/70 uppercase tracking-widest hidden md:block">Provisioning {offer.title} Protocol</p>
                    </div>
                    
                    <div className="pb-6 md:pb-0 shrink-0">
                      <button 
                        className="bg-black/30 backdrop-blur-3xl px-6 md:px-10 py-3 md:py-4 rounded-[1.5rem] border border-white/15 flex items-center gap-5 group/code cursor-pointer transition-all hover:bg-black/50 active:scale-95 shadow-2xl" 
                        onClick={() => handleCopy(offer.code)}
                      >
                         <div className="flex flex-col items-start text-left">
                            <span className="text-[7px] font-black uppercase text-white/50 tracking-widest leading-none mb-1">Signal Code</span>
                            <span className="text-base md:text-2xl font-black font-mono text-white tracking-widest italic">{offer.code}</span>
                         </div>
                         <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center transition-all group-hover/code:bg-primary group-hover/code:text-white shadow-inner">
                           {copied === offer.code ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <TicketPercent className="w-5 h-5 md:w-6 md:h-6" />}
                         </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
