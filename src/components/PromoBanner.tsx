'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, PartyPopper } from 'lucide-react';
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
      description: 'FLAT 10% OFF on every order.',
      gradient: 'from-[#FF6B00] to-[#FF8A00]'
    },
    {
      id: 'new-user',
      code: 'EZZYBITES15',
      title: 'Midnight Cravings',
      description: '15% OFF your first late-night meal.',
      gradient: 'from-[#6366F1] to-[#4F46E5]'
    },
    {
      id: 'weekend',
      code: 'WEEKEND20',
      title: 'Weekend Bonanza',
      description: 'FLAT 20% OFF this Sunday only.',
      gradient: 'from-[#F43F5E] to-[#E11D48]'
    }
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast({
      title: "Code Copied! 🚀",
      description: `Use ${code} at checkout.`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full relative">
      <Carousel
        opts={{ align: "start", loop: true }}
        plugins={[Autoplay({ delay: 5000 })]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {offers.map((offer) => (
            <CarouselItem key={offer.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
              <div className={cn(
                "relative w-full h-[140px] md:h-[160px] overflow-hidden rounded-[2rem] transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/10",
                "bg-gradient-to-br", offer.gradient
              )}>
                <div className="relative h-full flex flex-col justify-center p-6 md:p-8 z-10 text-center items-center">
                  <div className="space-y-3 w-full">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl px-3 py-1 rounded-full border border-white/20">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white">{offer.title}</span>
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-black text-white leading-tight uppercase tracking-tighter">
                      {offer.description}
                    </h3>
                    
                    <div className="flex justify-center">
                      <div 
                        className="bg-black/20 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 group/code cursor-pointer transition-all hover:bg-black/30" 
                        onClick={() => handleCopy(offer.code)}
                      >
                         <span className="text-sm md:text-base font-black font-mono text-white tracking-tighter">{offer.code}</span>
                         <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center transition-colors group-hover/code:bg-white/20">
                           {copied === offer.code ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-white/70" />}
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Clean Background Decoration */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -left-4 -top-4 w-20 h-20 bg-black/5 rounded-full blur-xl" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
