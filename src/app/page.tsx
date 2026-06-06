'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { PromoBanner } from '@/components/PromoBanner';
import { SavorTool } from '@/components/SavorTool';
import { 
  ShoppingBag, ChefHat, Truck, Award, 
  HelpCircle, Instagram, Twitter, Facebook,
  ArrowRight, History, Utensils, Loader2,
  Search, Star, Sparkles, Clock, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FoodCard } from '@/components/FoodCard';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { FoodItem } from '@/app/lib/store';

export default function Home() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const db = useFirestore();

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const highlightsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      where('isAvailable', '==', true),
      limit(6)
    );
  }, [db]);

  const { data: menuItems, loading: menuLoading } = useCollection<FoodItem>(highlightsQuery);

  const heroBg = "https://picsum.photos/seed/ezzybites-dark-hero/1920/1080";

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1">
        {/* HERO SECTION - CLEAN MINIMALIST STYLE */}
        <section className="relative min-h-[85vh] flex items-center pt-24 pb-20 overflow-hidden bg-black">
          <div className="absolute inset-0 z-0">
            <Image 
              src={heroBg}
              alt="Premium Background"
              fill
              className="object-cover opacity-50"
              priority
              data-ai-hint="dark abstract spiral background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
          </div>

          <div className="container mx-auto px-6 relative z-20 max-w-5xl">
            <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 shadow-2xl">
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/80">Premium Fast Food Redefined</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-[7rem] font-headline font-black leading-[0.95] tracking-tighter text-white uppercase">
                  Flavor that <br />
                  <span className="text-primary italic">Commands</span> <br />
                  Respect.
                </h1>
                <p className="text-base md:text-xl text-white/60 max-w-lg leading-relaxed font-medium">
                  Elevate your daily ritual with chef-crafted flavors delivered right to your sanctuary. Fresh ingredients, lightning speed.
                </p>
              </div>

              <div className="flex pt-4">
                <Link href="/menu">
                  <Button className="rounded-full h-16 md:h-18 px-12 text-lg font-black shadow-2xl bg-primary hover:bg-primary/90 text-white border-none transform transition-all active:scale-95 uppercase tracking-tight gap-3">
                    Start Your Order
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* MENU HIGHLIGHTS */}
        <section className="py-20 bg-white dark:bg-zinc-950">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <Badge variant="outline" className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border-primary/20 mb-4">Live Selection</Badge>
                <h2 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter">Signature <span className="text-primary italic">Highlights.</span></h2>
              </div>
              <Link href="/menu">
                <Button variant="ghost" className="font-black text-[11px] uppercase tracking-widest gap-2 text-primary hover:bg-primary/5 h-12 px-6 rounded-2xl">
                  Full Menu <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {menuLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-[2.5rem]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8">
                {menuItems?.map((item) => (
                  <FoodCard key={item.id} item={item} forceViewMode="small" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* OFFERS SECTION */}
        <section className="py-12 bg-secondary/10 dark:bg-zinc-900/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-px bg-border flex-1" />
               <h2 className="text-xl font-black uppercase tracking-tighter whitespace-nowrap">Limited <span className="text-primary italic">Offers</span></h2>
               <div className="h-px bg-border flex-1" />
            </div>
            <PromoBanner />
          </div>
        </section>

        {/* AI SAVOR TOOL */}
        <section className="py-20 container mx-auto px-4">
          <SavorTool />
        </section>

        {/* FEATURES */}
        <section className="py-20 bg-white dark:bg-zinc-950 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: ChefHat, title: "Master Chefs", desc: "Crafted by professionals who prioritize technique and flavor." },
                { icon: Truck, title: "Hyper-Local", desc: "A 25-minute delivery promise for all local sanctuary orders." },
                { icon: Award, title: "Gold Standard", desc: "Only A-grade ingredients. No preservatives, just pure taste." }
              ].map((f, i) => (
                <div key={i} className="bg-zinc-50 dark:bg-zinc-900/50 p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-border/20 group text-center">
                  <div className="w-16 h-16 bg-orange-gradient rounded-3xl flex items-center justify-center mb-8 text-white shadow-lg mx-auto group-hover:scale-110 transition-transform">
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black mb-3 uppercase tracking-tight">{f.title}</h4>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-headline font-black uppercase tracking-tighter">Common Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: "What is your delivery range?", a: "We serve a 3km radius around Pocharam and Anurag University campus for peak freshness." },
              { q: "Is there a student special?", a: "Yes! Use code STUDENT10 at checkout for 10% OFF on all orders above ₹200." },
              { q: "How do you handle bulk orders?", a: "For event catering, contact our hotline via WhatsApp for a custom logistics plan." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl px-8 shadow-sm overflow-hidden">
                <AccordionTrigger className="font-bold text-lg hover:no-underline py-6 text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-base font-medium leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <footer className="bg-white dark:bg-zinc-950 border-t pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-gradient rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-headline font-black tracking-tighter">Ezzy<span className="text-primary">Bites</span></span>
              </Link>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">Culinary art and lightning-fast logistics. Redefining campus life one bite at a time.</p>
              <div className="flex gap-3">
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <Button key={i} variant="outline" size="icon" className="w-10 h-10 rounded-xl text-muted-foreground hover:text-primary border-2"><Icon className="w-5 h-5" /></Button>
                ))}
              </div>
            </div>
            <div className="lg:col-start-3 space-y-6">
              <h4 className="font-black text-sm uppercase tracking-widest">Explore</h4>
              <ul className="space-y-3 text-muted-foreground font-bold text-sm">
                <li><Link href="/menu" className="hover:text-primary flex items-center gap-3"><Utensils className="w-4 h-4" /> Menu</Link></li>
                <li><Link href="/orders" className="hover:text-primary flex items-center gap-3"><History className="w-4 h-4" /> Order History</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-sm uppercase tracking-widest">Support</h4>
              <ul className="space-y-3 text-muted-foreground font-bold text-sm">
                <li><Link href="/admin/login" className="hover:text-primary">Staff Portal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-10 text-center">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-50">© {currentYear || 2025} Ezzy Bites Premium Cafe.</p>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
}