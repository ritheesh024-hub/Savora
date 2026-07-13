'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { PromoBanner } from '@/components/PromoBanner';
import { SavorTool } from '@/components/SavorTool';
import { 
  ArrowRight, Utensils, 
  ShieldCheck, Clock, Search,
  Zap, Star, Flame
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
import { motion } from 'framer-motion';

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
      
      <Navbar />

      <main className="flex-1 space-y-8 md:space-y-16">
        
        {/* PREMIUM FULL-BLEED HERO */}
        <div className="h-screen min-h-[700px] relative bg-black flex items-center overflow-hidden">
            
            {/* AMBIENT BACKGROUND SYSTEM */}
            <div className="absolute inset-0 z-0">
              <Image 
                src={heroBg}
                alt="Premium Culinary Backdrop"
                fill
                className="object-cover opacity-60"
                priority
                data-ai-hint="premium food"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 z-10" />
              
              {/* ORANGE AMBIENT LIGHTING */}
              <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/20 blur-[160px] rounded-full z-15 animate-pulse" />
            </div>

            {/* FLOATING PARTICLES */}
            <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
               {[...Array(12)].map((_, i) => (
                 <div 
                   key={i} 
                   className="particle"
                   style={{
                     left: `${Math.random() * 100}%`,
                     bottom: `-20px`,
                     animation: `float-particle ${5 + Math.random() * 5}s linear infinite`,
                     animationDelay: `${Math.random() * 5}s`,
                     width: `${2 + Math.random() * 4}px`,
                     height: `${2 + Math.random() * 4}px`,
                   }}
                 />
               ))}
            </div>

            {/* HERO CONTENT ENGINE */}
            <div className="container mx-auto px-8 md:px-20 relative z-20 max-w-7xl pt-32 pb-20">
              <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
                
                {/* PREMIUM BADGE */}
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/20 shadow-2xl">
                  <Flame className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white">Fresh • Fast • Delicious</span>
                </div>
                
                {/* HEADLINE MATRIX */}
                <div className="space-y-4 md:space-y-6">
                  <h1 className="text-5xl md:text-[8rem] font-headline font-black leading-[0.9] md:leading-[0.85] tracking-tighter text-white uppercase drop-shadow-2xl">
                    Flavor that <br />
                    <span className="text-primary italic relative">
                      Commands
                      <div className="absolute -bottom-2 left-0 w-full h-1.5 md:h-3 bg-primary/30 blur-sm rounded-full" />
                    </span> <br />
                    The Vibe.
                  </h1>
                  <p className="text-sm md:text-2xl text-white/60 max-w-2xl leading-relaxed font-medium">
                    Premium culinary engineering delivered with high-speed precision. Experience the next generation of campus dining.
                  </p>
                </div>

                {/* CTA CLUSTER */}
                <div className="flex flex-col sm:flex-row gap-5 pt-6">
                  <Link href="/menu">
                    <Button className="rounded-full h-18 md:h-24 px-12 md:px-16 text-lg md:text-2xl font-black shadow-4xl bg-orange-gradient hover:scale-[1.02] active:scale-95 text-white transform transition-all uppercase tracking-tight gap-6 premium-glow">
                      Launch Menu
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </Button>
                  </Link>
                  
                  <div className="flex items-center gap-6 px-4">
                     <div className="flex -space-x-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-zinc-800 overflow-hidden relative">
                             <Image src={`https://picsum.photos/seed/user-${i}/100/100`} alt="User" fill className="object-cover" unoptimized />
                          </div>
                        ))}
                     </div>
                     <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                           <Star className="w-3 h-3 fill-primary text-primary" />
                           <span className="text-white font-black text-xs">4.9/5</span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">5k+ Biters Joined</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* MOBILE SEARCH & CATEGORIES */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl md:hidden pt-4 pb-4 border-b shadow-xl px-4">
           <div className="container space-y-5">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground z-10" />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dishes, burgers, tea..." 
                  className="w-full h-14 pl-14 rounded-2xl bg-secondary/50 border-none font-bold text-base focus:ring-4 focus:ring-primary/20 !text-foreground shadow-inner"
                />
              </form>
              <Categories />
           </div>
        </div>

        {/* BOUNTIES SECTION */}
        <section className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-6 mb-8">
             <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-primary fill-primary" />
                <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Active <span className="text-primary italic">Bounties</span></h2>
             </div>
             <div className="h-px bg-border flex-1 opacity-50" />
             <Link href="/coupons" className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest">View All</Link>
          </div>
          <PromoBanner />
        </section>

        {/* HIGHLIGHTS ENGINE */}
        <section className="py-20 bg-zinc-50/50 dark:bg-zinc-900/10">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                   <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Signature Protocol</Badge>
                   <div className="flex items-center gap-1.5 text-emerald-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[9px] font-black uppercase">Live Kitchen Hub</span>
                   </div>
                </div>
                <h2 className="text-4xl md:text-7xl font-black font-headline uppercase tracking-tighter">Kitchen <span className="text-primary italic">Highlights.</span></h2>
              </div>
              <Link href="/menu" className="hidden sm:block">
                <Button variant="outline" className="h-16 px-10 rounded-2xl border-2 font-black uppercase text-[10px] tracking-widest gap-4 group">
                  Explore Full Catalog 
                  <Utensils className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
            </div>

            {menuLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <div key={i} className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-[2.5rem]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
                {menuItems?.map((item) => (
                  <FoodCard key={item.id} item={item} />
                ))}
              </div>
            )}
            
            <div className="mt-16 sm:hidden px-4">
               <Link href="/menu">
                  <Button className="w-full h-16 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] bg-zinc-950 text-white shadow-2xl">View Entire Menu Hub</Button>
               </Link>
            </div>
          </div>
        </section>

        {/* AI TOOLHUB */}
        <section className="py-20 container mx-auto px-4 max-w-6xl">
          <SavorTool />
        </section>

        {/* TRUST PROTOCOL INTEGRITY */}
        <section className="py-24 bg-zinc-950 text-white rounded-[4rem] mx-4 md:mx-8 mb-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5">
             <ShieldCheck className="w-96 h-96 text-primary rotate-12" />
          </div>
          <div className="container mx-auto px-8 relative z-10">
            <div className="text-center mb-20 space-y-4">
               <h2 className="text-3xl md:text-5xl font-black font-headline uppercase tracking-tighter">The Ezzy <span className="text-primary italic">Standard.</span></h2>
               <p className="text-white/40 font-medium text-sm md:text-lg max-w-2xl mx-auto">Zero-compromise culinary engineering delivered at the speed of campus life.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
              {[
                { icon: Utensils, title: "Master Craft", desc: "Chef-driven techniques applied to every single bite produced in our hub." },
                { icon: Clock, title: "Hyper-Speed", desc: "Real-time logistics tracking and guaranteed 25-minute campus delivery nodes." },
                { icon: ShieldCheck, title: "Gold Registry", desc: "Strict quality audits on all procurement nodes and ingredient chains." }
              ].map((f, i) => (
                <div key={i} className="group text-center flex flex-col items-center space-y-8">
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-primary shadow-2xl transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-white/10">
                    <f.icon className="w-10 h-10" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black uppercase tracking-tight italic">{f.title}</h4>
                    <p className="text-white/40 font-medium text-sm md:text-base leading-relaxed italic">"{f.desc}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16 space-y-3">
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mb-4" />
            <h2 className="text-4xl md:text-6xl font-headline font-black uppercase tracking-tighter">Operational <span className="text-primary">FAQ Hub</span></h2>
            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.4em]">Resolving common logistics inquiries</p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: "What is the operational delivery range?", a: "We maintain a high-speed 3km range around Pocharam and Anurag University to preserve culinary integrity and heat profiles." },
              { q: "Can I schedule pre-order nodes?", a: "Currently, our hub operates on a 'Hyper-Speed Live' model. For large event nodes (10+ members), please use the AI Support Hub." },
              { q: "Are there bulk student bounties?", a: "Affirmative. Use code CAMPUS30 for orders above ₹500 involving 5+ members. Verification occurs at delivery." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none bg-white dark:bg-zinc-900 rounded-[2rem] px-10 shadow-lg hover:shadow-xl transition-all overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <AccordionTrigger className="font-black text-base md:text-xl hover:no-underline py-8 text-left uppercase tracking-tight">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-8 text-sm md:text-lg font-medium leading-relaxed italic border-t border-dashed pt-6 opacity-80">"{faq.a}"</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <PWAInlinePromo />
      </main>

      <footer className="bg-zinc-50 dark:bg-zinc-900/50 border-t pt-24 pb-12 rounded-t-[4rem]">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-20 mb-20">
            <div className="space-y-8">
              <Logo size="md" className="scale-110 origin-left" />
              <p className="text-muted-foreground leading-relaxed text-sm font-medium italic opacity-70">"Culinary engineering meets hyper-fidelity delivery. Experience the future of campus fast food."</p>
              <div className="flex gap-4">
                 {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border" />)}
              </div>
            </div>
            <div className="lg:col-start-3 space-y-8">
              <h4 className="font-black text-[11px] uppercase tracking-[0.5em] text-primary">Core Registry</h4>
              <ul className="space-y-4 text-muted-foreground font-black text-[10px] uppercase tracking-widest">
                <li><Link href="/menu" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Menu Catalog</Link></li>
                <li><Link href="/orders" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Order Ledger</Link></li>
                <li><Link href="/admin/login" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Staff Terminal</Link></li>
              </ul>
            </div>
            <div className="space-y-8">
               <h4 className="font-black text-[11px] uppercase tracking-[0.5em] text-primary">Status Node</h4>
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black text-emerald-600 uppercase">Operational</span>
                  </div>
                  <p className="text-[9px] font-bold text-emerald-700/60 uppercase leading-relaxed">All systems green. Fleet is currently active in pocharam sector.</p>
               </div>
            </div>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-12 text-center">
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.6em] opacity-30">© {new Date().getFullYear()} EZZY BITES • QUANTUM FOOD-TECH PROTOCOL V5.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
