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

export const PromoBanner = () => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const offers = [
    {
      id: 'student',
      code: 'STUDENT10',
      title: 'Bite Into Big Savings.',
      subtitle: 'Exclusively for AU Students!',
      description: 'Get 10% OFF on every online order.',
      tag: 'Student Special',
      icon: GraduationCap,
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      accent: 'text-yellow-300'
    },
    {
      id: 'new-user',
      code: 'EZZYBITES15',
      title: 'Welcome to the Family.',
      subtitle: 'New Users Only!',
      description: 'Get 15% OFF on your first order.',
      tag: 'Limited Offer',
      icon: PartyPopper,
      gradient: 'from-red-600 via-orange-600 to-yellow-500',
      accent: 'text-white'
    }
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast({
      title: "Code Copied! 🚀",
      description: `Use ${code} at checkout for your discount.`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {offers.map((offer) => (
            <CarouselItem key={offer.id}>
              <div className="relative w-full overflow-hidden group min-h-[380px] md:min-h-[300px] flex items-center">
                <div className={`absolute inset-0 bg-gradient-to-r ${offer.gradient} animate-gradient-x`} />
                
                {/* Subtle Decorative Elements */}
                <div className="absolute top-[-20%] right-[-5%] w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse delay-700" />
                
                <div className="container mx-auto px-6 py-8 relative z-10">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10">
                    <div className="space-y-3 text-center lg:text-left flex-1">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 animate-bounce mx-auto lg:mx-0">
                        <offer.icon className="w-3.5 h-3.5 text-white" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">{offer.tag}</span>
                      </div>
                      
                      <h2 className="text-2xl md:text-4xl font-headline font-black text-white leading-none tracking-tighter">
                        {offer.title.split('.').map((part, i) => (
                          <React.Fragment key={i}>
                            {i === 0 ? part : <><span className={`${offer.accent} italic`}>{part}</span></>}
                          </React.Fragment>
                        ))}
                      </h2>
                      
                      <p className="text-white/80 text-xs md:text-base font-medium max-w-md mx-auto lg:mx-0">
                        {offer.subtitle} <span className="font-black text-white text-lg">{offer.description.split('OFF')[0]}OFF</span>{offer.description.split('OFF')[1]}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-2xl hover:scale-[1.01] transition-transform duration-500 w-full lg:w-auto max-w-lg">
                      <div className="space-y-1 w-full text-center md:text-left">
                        <p className="text-[8px] font-black uppercase text-white/60 tracking-[0.2em]">Coupon Code</p>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                          <span className="text-2xl md:text-3xl font-black font-mono text-white tracking-tighter">{offer.code}</span>
                          <button 
                            onClick={() => handleCopy(offer.code)}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all text-white shrink-0"
                          >
                            {copied === offer.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="hidden md:block h-10 w-px bg-white/20 shrink-0" />
                      
                      <Button 
                        onClick={() => window.location.href = '/menu'}
                        className="h-12 px-8 rounded-xl bg-white text-black hover:bg-zinc-100 font-black uppercase tracking-widest text-[10px] group/btn shadow-xl w-full md:w-auto"
                      >
                        Order Now
                        <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
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