'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, GraduationCap, ArrowRight, Sparkles, PartyPopper } from 'lucide-react';
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
      title: 'Bite Into Big Savings.',
      subtitle: 'Exclusively for Students!',
      description: 'Get 10% OFF on every order.',
      tag: 'Academic Special',
      icon: GraduationCap,
      gradient: 'from-[#0F2027] via-[#203A43] to-[#2C5364]',
      accent: 'text-sky-400'
    },
    {
      id: 'new-user',
      code: 'EZZYBITES15',
      title: 'Welcome to the Family.',
      subtitle: 'New Users Only!',
      description: 'Get 15% OFF your first meal.',
      tag: 'Limited Time',
      icon: PartyPopper,
      gradient: 'from-[#8E2DE2] to-[#4A00E0]',
      accent: 'text-white'
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
    <div className="w-full relative px-4">
      <Carousel
        opts={{ align: "start", loop: true }}
        plugins={[Autoplay({ delay: 5000 })]}
        className="w-full max-w-6xl mx-auto overflow-visible"
      >
        <CarouselContent className="-ml-0">
          {offers.map((offer) => (
            <CarouselItem key={offer.id} className="pl-0 pb-8">
              <div className="perspective-1000 group">
                <div className={cn(
                  "relative w-full h-[240px] md:h-[180px] overflow-hidden rounded-[2.5rem] transition-all duration-700 preserve-3d shadow-2xl group-hover:rotate-x-2 group-hover:rotate-y-[-2deg]",
                  "bg-gradient-to-br", offer.gradient
                )}>
                  {/* Glass Background Pattern */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150" />
                  
                  <div className="relative h-full flex flex-col md:flex-row items-center justify-between px-8 md:px-12 py-6 gap-6 z-10">
                    <div className="flex-1 text-center md:text-left space-y-2">
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-3 py-1 rounded-full border border-white/20 animate-in slide-in-from-left duration-700">
                        <offer.icon className="w-3.5 h-3.5 text-white animate-float" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/90">{offer.tag}</span>
                      </div>
                      
                      <h2 className="text-xl md:text-3xl font-headline font-black text-white leading-tight tracking-tight">
                        {offer.title.split('.').map((part, i) => (
                          <React.Fragment key={i}>
                            {i === 0 ? part : <><span className={cn("italic", offer.accent)}>{part}</span></>}
                          </React.Fragment>
                        ))}
                      </h2>
                      
                      <p className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-[0.1em]">
                        {offer.subtitle} • <span className="text-white">{offer.description}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-black/20 backdrop-blur-2xl border border-white/10 p-4 rounded-[2rem] shadow-3xl min-w-[280px]">
                      <div className="flex-1 space-y-0.5">
                        <p className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em]">Apply Code</p>
                        <span className="text-xl md:text-2xl font-black font-mono text-white tracking-tighter">{offer.code}</span>
                      </div>
                      <button 
                        onClick={() => handleCopy(offer.code)}
                        className="w-10 h-10 rounded-2xl bg-primary text-white hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-primary/20 shrink-0"
                      >
                        {copied === offer.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <div className="w-[1px] h-8 bg-white/10 mx-1 hidden md:block" />
                      <Button 
                        onClick={() => window.location.href = '/menu'}
                        variant="ghost"
                        className="h-10 px-4 rounded-xl text-white hover:bg-white/10 font-black uppercase tracking-widest text-[9px] hidden md:flex gap-2"
                      >
                        Go <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Floating 3D Elements */}
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -left-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse delay-1000" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};