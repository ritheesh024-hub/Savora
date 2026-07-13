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

      <main className="flex-1 space-y-10 md:space-y-16">
        
        {/* REFINED PREMIUM HERO HUB */}
        <div className="h-[70vh] min-h-[550px] md:min-h-[600px] relative bg-black flex items-center overflow-hidden">
            
            {/* AMBIENT BACKGROUND SYSTEM */}
            <div className="absolute inset-0 z-0">
              <Image 
                src={heroBg}
                alt="Premium Culinary Backdrop"
                fill
                className="object-cover opacity-50"
                priority
                data-ai-hint="premium food"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
              
              {/* ORANGE AMBIENT LIGHTING - SCALED DOWN */}
              <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-primary/10 blur-[140px] rounded-full z-15 animate-pulse" />
            </div>

            {/* FLOATING PARTICLES - REDUCED COUNT */}
            <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
               {[...Array(8)].map((_, i) => (
                 <div 
                   key={i} 
                   className="particle"
                   style={{
                     left: `${Math.random() * 100}%`,
                     bottom: `-20px`,
                     animation: `float-particle ${6 + Math.random() * 6}s linear infinite`,
                     animationDelay: `${Math.random() * 4}s`,
                     width: `${2 + Math.random() * 3}px`,
                     height: `${2 + Math.random() * 3}px`,
                   }}
                 />
               ))}
            </div>

            {/* HERO CONTENT ENGINE - COMPACT LAYOUT */}
            <div className="container mx-auto px-6 md:px-16 lg:px-24 relative z-20 max-w-7xl pt-28 pb-16">
              <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
                
                {/* PREMIUM BADGE */}
                <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/15 shadow-2xl">
                  <Flame className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span className="text-[9px] font-black tracking-[0.25em] uppercase text-white">🔥 Fresh • Fast • Delicious</span>
                </div>
                
                {/* HEADLINE MATRIX - REDUCED SCALE */}
                <div className="space-y-3 md:space-y-5">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-black leading-[0.95] tracking-tighter text-white uppercase drop-shadow-2xl">
                    Flavor that <br />
                    <span className="text-primary italic relative">
                      Commands
                      <div className="absolute -bottom-1.5 left-0 w-full h-1 md:h-2 bg-primary/30 blur-sm rounded-full" />
                    </span> <br />
                    The Vibe.
                  </h1>
                  <p className="text-sm md:text-lg text-white/60 max-w-xl leading-relaxed font-medium">
                    Premium culinary engineering delivered with high-speed precision. Experience the next generation of campus dining nodes.
                  </p>
                </div>

                {/* CTA CLUSTER - COMPACT SCALE */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
                  <Link href="/menu">
                    <Button className="rounded-full h-14 md:h-16 px-10 md:px-12 text-base md:text-lg font-black shadow-4xl bg-orange-gradient hover:scale-[1.02] active:scale-95 text-white transform transition-all uppercase tracking-tight gap-4 premium-glow">
                      Launch Menu
                      <div className="w-8 h-8 md:w-9 md:h-9 bg-white/20 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </Button>
                  </Link>
                  
                  <div className="flex items-center gap-4 px-2">
                     <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden relative shadow-lg">
                             <Image src={`https://picsum.photos/seed/user-${i}/80/80`} alt="User" fill className="object-cover" unoptimized />
                          </div>
                        ))}
                     </div>
                     <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                           <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                           <span className="text-white font-black text-[11px]">4.9 Node Rating</span>
                        </div>
                        <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">5k+ Biters Joined</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* MOBILE SEARCH & CATEGORIES - STICKY NODE */}
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
          <div className="flex items-center gap-6 mb-6">
             <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary fill-primary" />
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Active <span className="text-primary">Bounties</span></h2>
             </div>
             <div className="h-px bg-border flex-1 opacity-50" />
             <Link href="/coupons" className="text-[9px] font-black uppercase text-primary hover:underline tracking-[0.2em]">View All</Link>
          </div>
          <PromoBanner />
        </section>

        {/* HIGHLIGHTS ENGINE */}
        <section className="py-16 bg-zinc-50/50 dark:bg-zinc-900/10">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Signature Protocol</Badge>
                   <div className="flex items-center gap-1.5 text-emerald-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-[8px] font-black uppercase">Live Kitchen Hub</span>
                   </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-black font-headline uppercase tracking-tighter">Kitchen <span className="text-primary italic">Highlights.</span></h2>
              </div>
              <Link href="/menu" className="hidden sm:block">
                <Button variant="outline" className="h-14 px-8 rounded-xl border-2 font-black uppercase text-[9px] tracking-widest gap-3 group">
                  Explore Full Catalog 
                  <Utensils className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
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
            
            <div className="mt-12 sm:hidden px-4">
               <Link href="/menu">
                  <Button className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] bg-zinc-950 text-white shadow-xl">View Entire Menu Hub</Button>
               </Link>
            </div>
          </div>
        </section>

        {/* AI TOOLHUB */}
        <section className="py-16 container mx-auto px-4 max-w-6xl">
          <SavorTool />
        </section>

        {/* TRUST PROTOCOL INTEGRITY */}
        <section className="py-20 bg-zinc-950 text-white rounded-[3rem] md:rounded-[4rem] mx-4 md:mx-8 mb-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5">
             <ShieldCheck className="w-80 h-80 text-primary rotate-12" />
          </div>
          <div className="container mx-auto px-8 relative z-10">
            <div className="text-center mb-16 space-y-3">
               <h2 className="text-3xl md:text-5xl font-black font-headline uppercase tracking-tighter">The Ezzy <span className="text-primary italic">Standard.</span></h2>
               <p className="text-white/40 font-medium text-sm md:text-lg max-w-xl mx-auto italic opacity-80">Zero-compromise culinary engineering delivered at the speed of campus life.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
              {[
                { icon: Utensils, title: "Master Craft", desc: "Chef-driven techniques applied to every single bite produced in our hub." },
                { icon: Clock, title: "Hyper-Speed", desc: "Real-time logistics tracking and guaranteed 25-minute campus delivery nodes." },
                { icon: ShieldCheck, title: "Gold Registry", desc: "Strict quality audits on all procurement nodes and ingredient chains." }
              ].map((f, i) => (
                <div key={i} className="group text-center flex flex-col items-center space-y-6">
                  <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-primary shadow-2xl transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-white/10">
                    <f.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase tracking-tight italic">{f.title}</h4>
                    <p className="text-white/40 font-medium text-sm leading-relaxed italic">"{f.desc}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 space-y-2">
            <div className="w-12 h-1 bg-primary mx-auto rounded-full mb-4" />
            <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter">Operational <span className="text-primary">FAQ Hub</span></h2>
            <p className="text-muted-foreground font-bold text-[9px] uppercase tracking-[0.4em] opacity-60">Resolving common logistics inquiries</p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {[
              { q: "What is the operational delivery range?", a: "We maintain a high-speed 3km range around Pocharam and Anurag University to preserve culinary integrity and heat profiles." },
              { q: "Can I schedule pre-order nodes?", a: "Currently, our hub operates on a 'Hyper-Speed Live' model. For large event nodes (10+ members), please use the AI Support Hub." },
              { q: "Are there bulk student bounties?", a: "Affirmative. Use code CAMPUS30 for orders above ₹500 involving 5+ members. Verification occurs at delivery." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none bg-white dark:bg-zinc-900 rounded-[1.5rem] md:rounded-[2rem] px-8 md:px-10 shadow-lg hover:shadow-xl transition-all overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <AccordionTrigger className="font-black text-sm md:text-lg hover:no-underline py-6 md:py-8 text-left uppercase tracking-tight">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 md:pb-8 text-xs md:text-base font-medium leading-relaxed italic border-t border-dashed pt-6 opacity-80">"{faq.a}"</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <PWAInlinePromo />
      </main>

      <footer className="bg-zinc-50 dark:bg-zinc-900/50 border-t pt-20 pb-10 rounded-t-[3rem] md:rounded-t-[4rem]">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16">
            <div className="space-y-6">
              <Logo size="sm" className="scale-110 origin-left" />
              <p className="text-muted-foreground leading-relaxed text-sm font-medium italic opacity-70">"Culinary engineering meets hyper-fidelity delivery. Experience the future of campus fast food."</p>
              <div className="flex gap-3">
                 {[1, 2, 3].map(i => <div key={i} className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border" />)}
              </div>
            </div>
            <div className="lg:col-start-3 space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-primary">Core Registry</h4>
              <ul className="space-y-3 text-muted-foreground font-black text-[9px] uppercase tracking-widest">
                <li><Link href="/menu" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Menu Catalog</Link></li>
                <li><Link href="/orders" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Order Ledger</Link></li>
                <li><Link href="/admin/login" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Staff Terminal</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
               <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-primary">Status Node</h4>
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black text-emerald-600 uppercase">Operational</span>
                  </div>
                  <p className="text-[8px] font-bold text-emerald-700/60 uppercase leading-relaxed">All systems green. Fleet is currently active in pocharam sector.</p>
               </div>
            </div>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-10 text-center">
            <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.5em] opacity-30">© {new Date().getFullYear()} EZZY BITES • QUANTUM FOOD-TECH PROTOCOL V5.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
