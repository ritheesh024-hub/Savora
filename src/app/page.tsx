
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { PromoBanner } from '@/components/PromoBanner';
import { SavorTool } from '@/components/SavorTool';
import { 
  ArrowRight, Utensils, 
  ShieldCheck, Clock, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FoodCard } from '@/components/FoodCard';
import { Categories } from '@/components/Categories';
import Link from 'next/link';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { FoodItem } from '@/app/lib/store';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { PWAInlinePromo } from '@/components/PWAInlinePromo';
import placeholderData from '@/app/lib/placeholder-images.json';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const highlightsQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'products'),
      limit(10)
    );
  }, [db]);

  const { data: menuItems, loading: menuLoading } = useCollection<FoodItem>(highlightsQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/menu?q=${encodeURIComponent(search.trim())}`);
  };

  const heroBg = placeholderData.placeholderImages.find(img => img.id === 'hero-premium-bg')?.imageUrl || '';

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden">
      
      <main className="flex-1 space-y-4 md:space-y-8">
        
        {/* PREMIUM ROUNDED HERO CONTAINER */}
        <div className="p-3 md:p-6 lg:p-8">
          <div className="rounded-[3rem] md:rounded-[4.5rem] overflow-hidden border border-white/10 shadow-3xl relative bg-black">
            
            {/* INTEGRATED NAVBAR */}
            <Navbar isIntegrated />

            {/* HERO CONTENT */}
            <section className="relative min-h-[500px] md:min-h-[70vh] flex items-center pt-24 pb-12 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <Image 
                  src={heroBg}
                  alt="Premium Background"
                  fill
                  className="object-cover opacity-70"
                  priority
                  data-ai-hint="premium food"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
              </div>

              <div className="container mx-auto px-6 md:px-12 relative z-20 max-w-7xl">
                <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-1000">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-3xl px-5 py-2 rounded-full border border-white/20 shadow-2xl">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white">Elite Fast Food Protocol</span>
                  </div>
                  
                  <div className="space-y-2 md:space-y-4">
                    <h1 className="text-4xl md:text-[6rem] font-headline font-black leading-[0.95] md:leading-[0.85] tracking-tighter text-white uppercase">
                      Flavor that <br />
                      <span className="text-primary italic">Commands</span> <br />
                      The Vibe.
                    </h1>
                    <p className="text-xs md:text-xl text-white/60 max-w-xl leading-relaxed font-medium">
                      Premium culinary engineering delivered with high-speed precision to your campus sanctuary.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href="/menu">
                      <Button className="rounded-full h-16 md:h-20 px-10 md:px-12 text-base md:text-lg font-black shadow-3xl bg-primary hover:bg-primary/90 text-white transform transition-all active:scale-95 uppercase tracking-tight gap-4">
                        Launch Menu
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* MOBILE SEARCH & CATEGORIES */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl md:hidden pt-3 pb-3 border-b shadow-sm">
           <div className="container px-4 space-y-4">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dishes, burgers, tea..." 
                  className="w-full h-12 pl-12 rounded-2xl bg-secondary/50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 !text-foreground shadow-inner"
                />
              </form>
              <Categories />
           </div>
        </div>

        {/* BOUNTIES SECTION */}
        <section className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-4 mb-4">
             <h2 className="text-sm md:text-lg font-black uppercase tracking-tighter whitespace-nowrap">Active <span className="text-primary italic">Bounties</span></h2>
             <div className="h-px bg-border flex-1 opacity-50" />
          </div>
          <PromoBanner />
        </section>

        {/* HIGHLIGHTS */}
        <section className="py-12 bg-white dark:bg-zinc-950">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-end mb-10 gap-4">
              <div className="space-y-1">
                <Badge variant="outline" className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border-primary/20">Signature Selection</Badge>
                <h2 className="text-3xl md:text-5xl font-black font-headline uppercase tracking-tighter">Kitchen <span className="text-primary italic">Highlights.</span></h2>
              </div>
              <Link href="/menu" className="hidden sm:block">
                <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest gap-2 text-primary hover:bg-primary/5 h-12 px-6 rounded-xl border-2 border-primary/10">
                  Full Catalog <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {menuLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                {menuItems?.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            )}
            
            <div className="mt-10 sm:hidden">
               <Link href="/menu">
                  <Button className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-zinc-950 text-white shadow-xl">View Entire Menu</Button>
               </Link>
            </div>
          </div>
        </section>

        {/* AI TOOL */}
        <section className="py-12 container mx-auto px-4 max-w-6xl">
          <SavorTool />
        </section>

        {/* TRUST PROTOCOL */}
        <section className="py-16 bg-zinc-50 dark:bg-zinc-900/20 border-y">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {[
                { icon: Utensils, title: "Master Craft", desc: "Chef-driven techniques applied to every single bite." },
                { icon: Clock, title: "Precision Logistics", desc: "Real-time tracking and 25-minute campus range." },
                { icon: ShieldCheck, title: "Gold Registry", desc: "Strict quality audits on all procurement nodes." }
              ].map((f, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 p-10 rounded-[3rem] shadow-xl border border-border/10 group text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-orange-gradient rounded-2xl flex items-center justify-center mb-6 text-white shadow-2xl transform group-hover:scale-110 transition-transform">
                    <f.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black mb-2 uppercase tracking-tight">{f.title}</h4>
                  <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-[240px] italic">"{f.desc}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl md:text-4xl font-headline font-black uppercase tracking-tighter">Operational <span className="text-primary">FAQ</span></h2>
            <p className="text-muted-foreground font-medium text-sm">Resolving common logistics inquiries.</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: "What is your delivery range?", a: "We maintain a high-speed 3km range around Pocharam and Anurag University to preserve culinary integrity." },
              { q: "Can I schedule a pre-order?", a: "Currently, our hub operates on a 'High-Speed Live' model. For large event nodes, use the AI Support Hub." },
              { q: "Are there bulk student bounties?", a: "Affirmative. Use code CAMPUS30 for orders above ₹500 involving 5+ members." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none bg-zinc-50 dark:bg-zinc-900 rounded-3xl px-8 shadow-sm overflow-hidden">
                <AccordionTrigger className="font-black text-sm md:text-lg hover:no-underline py-6 text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-sm md:text-base font-medium leading-relaxed italic">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <PWAInlinePromo />
      </main>

      <footer className="bg-white dark:bg-zinc-950 border-t pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
            <div className="space-y-6">
              <Logo size="md" className="scale-110 origin-left" />
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">Culinary engineering meet high-fidelity delivery. Experience the future of campus fast food.</p>
            </div>
            <div className="lg:col-start-3 space-y-6">
              <h4 className="font-black text-[11px] uppercase tracking-[0.4em] opacity-40">Core Registry</h4>
              <ul className="space-y-3 text-muted-foreground font-bold text-sm">
                <li><Link href="/menu" className="hover:text-primary transition-colors">Menu Catalog</Link></li>
                <li><Link href="/orders" className="hover:text-primary transition-colors">Order Ledger</Link></li>
                <li><Link href="/admin/login" className="hover:text-primary transition-colors">Staff Terminal</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-10 text-center">
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.5em] opacity-30">© {new Date().getFullYear()} EZZY BITES • QUANTUM FOOD-TECH PROTOCOL</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
