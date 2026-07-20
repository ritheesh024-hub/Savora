
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { SavorTool } from '@/components/SavorTool';
import { 
  ArrowRight, Utensils, 
  ShieldCheck, Clock, Search,
  Zap, Star, Flame, MapPin, Phone,
  ChevronRight, Sparkles, ShoppingBag,
  Timer, Info, MessageSquare,
  Map,
  CheckCircle2,
  ChefHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FoodCard } from '@/components/FoodCard';
import { Categories } from '@/components/Categories';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, orderBy, where } from 'firebase/firestore';
import { FoodItem } from '@/app/lib/store';
import { Logo } from '@/components/Logo';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { PWAInlinePromo } from '@/components/PWAInlinePromo';
import placeholderData from '@/app/lib/placeholder-images.json';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalSettings } from '@/hooks/use-global-settings';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const { settings, loading: settingsLoading } = useGlobalSettings();
  
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // QUERY: Highlights/Popular
  const popularQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), where('isPopular', '==', true), limit(8));
  }, [db]);
  const { data: popularItems, loading: popularLoading } = useCollection<FoodItem>(popularQuery);

  // QUERY: Latest Reviews
  const reviewsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'reviews'), where('isHidden', '==', false), orderBy('createdAt', 'desc'), limit(10));
  }, [db]);
  const { data: reviews, loading: reviewsLoading } = useCollection<any>(reviewsQuery);

  // QUERY: All Items (Highlights) - Increased limit for categorized menu
  const highlightsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'), limit(50));
  }, [db]);
  const { data: menuItems, loading: menuLoading } = useCollection<FoodItem>(highlightsQuery);

  const categorizedItems = useMemo(() => {
    if (!menuItems) return {};
    const groups: Record<string, FoodItem[]> = {};
    menuItems.forEach(item => {
      const cat = item.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [menuItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/menu?q=${encodeURIComponent(search.trim())}`);
  };

  const heroBg = placeholderData.placeholderImages.find(img => img.id === 'hero-premium-bg')?.imageUrl || '';

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden">
      
      <Navbar />

      <main className="flex-1 space-y-8 md:space-y-12">
        
        {/* CINEMATIC HERO HUB */}
        <section className="h-[65vh] min-h-[500px] md:min-h-[600px] relative bg-black flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <Image 
                src={heroBg}
                alt="Premium Culinary Backdrop"
                fill
                className="object-cover opacity-60 scale-105"
                priority
                data-ai-hint="premium food"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
            </div>

            <div className="container mx-auto px-6 md:px-16 lg:px-24 relative z-20 max-w-7xl pt-16">
              <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-left-6 duration-1000">
                
                <div className="flex flex-wrap items-center gap-3">
                   <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-2xl px-4 py-1.5 rounded-full border border-white/15 shadow-2xl">
                      <Flame className="w-3 h-3 text-primary animate-pulse" />
                      <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white">🔥 Premium Fast Food Cafe</span>
                   </div>
                   {settings && (
                     <div className={cn(
                       "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest backdrop-blur-md",
                       settings.isOpen ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-rose-500/20 border-rose-500/30 text-rose-400"
                     )}>
                        <div className={cn("w-1 h-1 rounded-full animate-ping", settings.isOpen ? "bg-emerald-500" : "bg-rose-500")} />
                        {settings.isOpen ? 'Operational Now' : 'Station Dormant'}
                     </div>
                   )}
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline font-black leading-[0.95] tracking-tighter text-white uppercase drop-shadow-2xl">
                    Elite Flavor <br />
                    <span className="text-primary italic relative">
                      Guaranteed.
                    </span>
                  </h1>
                  <p className="text-sm md:text-lg text-white/60 max-w-xl leading-relaxed font-medium italic">
                    Premium culinary engineering delivered at hyper-speed. Experience the future of campus dining nodes.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                  <Link href="/menu">
                    <Button className="rounded-full h-14 md:h-14 px-8 md:px-10 text-base font-black shadow-4xl bg-orange-gradient hover:scale-[1.02] active:scale-95 text-white transform transition-all uppercase tracking-tight gap-3 premium-glow">
                      Start Selection
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Button>
                  </Link>
                  
                  <div className="flex items-center gap-4 py-2 px-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Average Dispatch</span>
                        <div className="flex items-center gap-1.5">
                           <Timer className="w-3.5 h-3.5 text-primary" />
                           <span className="text-white font-black text-xs">25-30 Mins</span>
                        </div>
                     </div>
                     <div className="w-px h-6 bg-white/10" />
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">Campus Rating</span>
                        <div className="flex items-center gap-1.5">
                           <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                           <span className="text-white font-black text-xs">4.9 Node</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
        </section>

        {/* MOBILE SEARCH & CATEGORIES - STICKY NODE */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl md:hidden pt-3 pb-3 border-b shadow-lg px-4">
           <div className="container space-y-3">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dishes, burgers, tea..." 
                  className="w-full h-12 pl-12 rounded-2xl bg-secondary/50 border-none font-bold text-sm focus:ring-4 focus:ring-primary/20 shadow-inner"
                />
              </form>
              
              <Categories />
           </div>
        </div>

        {/* POPULAR TODAY SLIDER (TOP PICKS) */}
        <section className="container mx-auto px-4 max-w-7xl">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-1">
                   <Badge className="bg-orange-500 text-white border-none text-[7px] font-black uppercase px-2 rounded-md">Trending</Badge>
                   <span className="text-[7px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Updated every 24 hours</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black font-headline uppercase tracking-tighter">Popular <span className="text-primary italic">Bites.</span></h2>
              </div>
           </div>
           
           <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
              {popularLoading ? (
                [1, 2, 3, 4, 5].map(i => <div key={i} className="min-w-[220px] aspect-[4/5] bg-secondary animate-pulse rounded-3xl shrink-0" />)
              ) : (
                popularItems?.map((item) => (
                  <div key={item.id} className="min-w-[240px] md:min-w-[280px] snap-start">
                    <FoodCard item={item} variant="card" />
                  </div>
                ))
              )}
           </div>
        </section>

        {/* CATEGORIZED FULL MENU (SWIGGY/ZOMATO STYLE) */}
        <section className="container mx-auto px-4 max-w-4xl pb-12">
          <div className="space-y-10 md:space-y-14">
            {Object.entries(categorizedItems).map(([category, items]) => (
              <div key={category} id={`section-${category}`} className="space-y-4 scroll-mt-24">
                <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-900/5">
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                    {category} 
                    <Badge variant="secondary" className="bg-zinc-100 text-zinc-500 border-none font-black text-[9px] px-2 h-5 flex items-center">{items.length}</Badge>
                  </h3>
                </div>
                <div className="divide-y divide-zinc-100">
                  {items.map(item => (
                    <FoodCard key={item.id} item={item} variant="list" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMBO OFFERS */}
        <section className="container mx-auto px-4 max-w-7xl">
           <div className="bg-orange-gradient p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-4xl group">
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
              
              <div className="max-w-xl space-y-4 relative z-10 text-center md:text-left">
                 <div className="inline-flex items-center gap-2 bg-black/10 px-3 py-1 rounded-full border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Mega Value Protocol</span>
                 </div>
                 <h2 className="text-3xl md:text-5xl font-black font-headline uppercase tracking-tighter leading-none italic">Elite <br /> Meal Combos.</h2>
                 <p className="text-white/80 font-medium text-base italic">"Save up to ₹150 with our curated flavor combinations."</p>
                 <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link href="/menu?q=Combo">
                       <Button className="h-12 px-8 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-[0.1em] shadow-2xl hover:scale-105 transition-all">Launch Combo Hub</Button>
                    </Link>
                    <div className="flex items-center gap-3 px-5 h-12 bg-black/20 rounded-full border border-white/10">
                       <ShoppingBag className="w-4 h-4 text-white/60" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Free Delivery</span>
                    </div>
                 </div>
              </div>

              <div className="relative w-full md:w-[400px] aspect-[4/3] rounded-[2rem] overflow-hidden shadow-4xl transform md:rotate-2 hover:rotate-0 transition-transform duration-1000 border-4 md:border-8 border-white/10 shrink-0">
                 <Image 
                   src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop" 
                   alt="Combo Feast" 
                   fill 
                   className="object-cover"
                   unoptimized
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase px-3 py-1 rounded-lg shadow-xl">Combo Pack V5.0</Badge>
                    <span className="text-xl font-black text-white italic">SAVE ₹99</span>
                 </div>
              </div>
           </div>
        </section>

        {/* LIVE CUSTOMER REVIEWS */}
        <section className="container mx-auto px-4 max-w-7xl pt-4">
           <div className="text-center mb-10 space-y-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                 <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden relative bg-zinc-200">
                         <Image src={`https://picsum.photos/seed/reviewer-${i}/100/100`} alt="User" fill className="object-cover" unoptimized />
                      </div>
                    ))}
                 </div>
                 <Badge className="bg-emerald-50/10 text-emerald-500 border-none px-2 py-0.5 font-black text-[8px] uppercase tracking-widest rounded-full">5k+ Biters</Badge>
              </div>
              <h2 className="text-3xl md:text-5xl font-black font-headline uppercase tracking-tighter">Campus <span className="text-primary italic">Pulse.</span></h2>
           </div>

           <div className="flex overflow-x-auto gap-4 md:gap-6 pb-10 scrollbar-hide snap-x">
              {reviewsLoading ? (
                 [1, 2, 3].map(i => <div key={i} className="min-w-[280px] h-40 bg-secondary/50 animate-pulse rounded-3xl" />)
              ) : reviews?.length === 0 ? (
                 <div className="w-full py-16 text-center border-2 border-dashed rounded-[2.5rem] opacity-20">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] italic">Waiting for Feedback</p>
                 </div>
              ) : (
                reviews.map((rev: any) => (
                  <Card key={rev.id} className="min-w-[280px] md:min-w-[340px] rounded-[2rem] border-none shadow-lg bg-white dark:bg-zinc-900 p-6 snap-start hover:shadow-xl transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10 rounded-xl shadow-md border-2 border-white dark:border-zinc-800 shrink-0">
                              <AvatarImage src={rev.userPhoto} />
                              <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">{(rev.userName || 'S').slice(0, 2)}</AvatarFallback>
                           </Avatar>
                           <div className="min-w-0">
                              <h4 className="font-black text-xs uppercase tracking-tight truncate max-w-[100px]">{rev.userName}</h4>
                              <p className="text-[7px] font-black text-muted-foreground uppercase opacity-40">{rev.createdAt?.toDate ? format(rev.createdAt.toDate(), 'dd MMM') : 'Recent'}</p>
                           </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1">
                           <Star className="w-3 h-3 fill-current" /> {rev.rating}
                        </Badge>
                     </div>
                     <p className="text-xs font-medium leading-relaxed italic text-muted-foreground group-hover:text-foreground transition-colors line-clamp-3">
                        "{rev.comment || 'Perfect bite!'}"
                     </p>
                     <div className="mt-4 pt-4 border-t border-dashed flex justify-between items-center opacity-40">
                        <div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-widest">
                           <Utensils className="w-2.5 h-2.5 text-primary" /> {rev.productName}
                        </div>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                     </div>
                  </Card>
                ))
              )}
           </div>
        </section>

        {/* RESTAURANT INFORMATION NODE */}
        <section className="container mx-auto px-4 max-w-7xl pb-4">
           <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
              <Card className="rounded-[2.5rem] md:rounded-[3rem] border-none shadow-xl bg-zinc-900 text-white overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Clock className="w-48 h-48 rotate-12" />
                 </div>
                 <CardContent className="p-8 md:p-12 space-y-8 relative z-10">
                    <div className="space-y-1">
                       <h3 className="text-2xl md:text-4xl font-black font-headline uppercase tracking-tighter italic">Station <span className="text-primary">Logs.</span></h3>
                    </div>

                    <div className="space-y-4">
                       {[
                         { day: 'MON - FRI', hours: '08:00 AM - 10:00 PM', status: 'Standard' },
                         { day: 'SATURDAY', hours: '09:00 AM - 11:00 PM', status: 'Extended' },
                         { day: 'SUNDAY', hours: '10:00 AM - 09:00 PM', status: 'Weekend' },
                       ].map((log, i) => (
                         <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group/row">
                            <div>
                               <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-0.5">{log.day}</p>
                               <h4 className="text-base md:text-lg font-black italic">{log.hours}</h4>
                            </div>
                            <Badge variant="outline" className="border-white/10 text-white/40 font-black text-[6px] uppercase px-2 py-0.5 rounded-md group-hover/row:border-primary group-hover/row:text-primary transition-all">{log.status}</Badge>
                         </div>
                       ))}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                       <Button onClick={() => window.open(`tel:${settings?.contactNumber || '8639366800'}`)} className="h-12 flex-1 rounded-xl bg-white text-black font-black uppercase text-[9px] tracking-widest gap-2 shadow-xl">
                          <Phone className="w-3.5 h-3.5" /> Signal Hotline
                       </Button>
                       <Button variant="outline" className="h-12 flex-1 rounded-xl border-white/10 text-white font-black uppercase text-[9px] tracking-widest gap-2 hover:bg-white/5 border-2">
                          <Info className="w-3.5 h-3.5" /> Policy Audit
                       </Button>
                    </div>
                 </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] md:rounded-[3rem] border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden relative flex flex-col">
                 <div className="absolute top-0 right-0 p-10 opacity-5">
                    <MapPin className="w-48 h-48 -rotate-12 text-primary" />
                 </div>
                 <CardContent className="p-8 md:p-12 flex-1 flex flex-col justify-between space-y-8 relative z-10">
                    <div className="space-y-6">
                       <div className="space-y-1">
                          <h3 className="text-2xl md:text-4xl font-black font-headline uppercase tracking-tighter italic">The <span className="text-primary italic">Sanctuary.</span></h3>
                       </div>
                       
                       <div className="space-y-5">
                          <div className="flex gap-4 items-start">
                             <div className="w-12 h-12 bg-secondary rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-inner">
                                <MapPin className="w-6 h-6 text-primary" />
                             </div>
                             <div>
                                <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-0.5">Pocharam Sector</p>
                                <p className="text-base md:text-lg font-bold leading-tight uppercase italic">{settings?.address || 'Near Anurag University, Hyderabad'}</p>
                             </div>
                          </div>
                          <div className="flex gap-4 items-start">
                             <div className="w-12 h-12 bg-secondary rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-inner">
                                <Timer className="w-6 h-6 text-primary" />
                             </div>
                             <div>
                                <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-0.5">Delivery Range</p>
                                <p className="text-base md:text-lg font-bold leading-tight uppercase italic">3.5 KM Radius Pulse</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <Button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.address || 'Savora Pocharam')}`)} className="h-14 w-full rounded-xl bg-zinc-950 text-white font-black uppercase text-[10px] tracking-[0.1em] shadow-3xl gap-3 hover:bg-primary transition-all">
                       <Map className="w-4 h-4" /> Launch Navigation Hub
                    </Button>
                 </CardContent>
              </Card>
           </div>
        </section>

        {/* AI TOOLHUB INTEGRATION */}
        <section className="py-12 container mx-auto px-4 max-w-5xl">
           <div className="text-center mb-8 space-y-2">
              <Badge className="bg-primary/10 text-primary border-none font-black text-[8px] uppercase px-3 py-1 rounded-full tracking-widest">Intelligent Engine</Badge>
              <h2 className="text-2xl md:text-4xl font-black font-headline uppercase tracking-tighter italic">Flavor <span className="text-primary italic">Intelligence.</span></h2>
           </div>
           <SavorTool />
        </section>

        {/* TRUST PROTOCOL INTEGRITY */}
        <section className="py-16 bg-zinc-950 text-white rounded-[2.5rem] md:rounded-[4rem] mx-4 md:mx-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-5">
             <ShieldCheck className="w-64 h-64 text-primary rotate-12" />
          </div>
          <div className="container mx-auto px-8 relative z-10 max-w-7xl">
            <div className="text-center mb-12 space-y-2">
               <h2 className="text-3xl md:text-5xl font-black font-headline uppercase tracking-tighter">The Savora <span className="text-primary italic">Standard.</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                { icon: Utensils, title: "Master Craft", desc: "Chef-driven techniques applied to every bite." },
                { icon: Clock, title: "Hyper-Speed", desc: "Real-time logistics and 25-min delivery nodes." },
                { icon: ShieldCheck, title: "Gold Registry", desc: "Strict quality audits on all procurement nodes." }
              ].map((f, i) => (
                <div key={i} className="group text-center flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-primary shadow-2xl transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-white/10">
                    <f.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-black uppercase tracking tight italic">{f.title}</h4>
                    <p className="text-white/40 font-medium text-sm italic">"{f.desc}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PWA PROMO NODE */}
        <section className="container mx-auto px-4 max-w-7xl py-4">
           <PWAInlinePromo />
        </section>

        {/* FAQ CLUSTER */}
        <section className="py-12 container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10 space-y-1">
            <h2 className="text-3xl md:text-5xl font-headline font-black uppercase tracking-tighter">FAQ <span className="text-primary italic">Hub.</span></h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {[
              { q: "What is the operational delivery range?", a: "We maintain a high-speed 3.5km range around Pocharam and Anurag University." },
              { q: "Can I schedule pre-order nodes?", a: "Currently, our hub operates on a 'Hyper-Speed Live' model." },
              { q: "Are there bulk student bounties?", a: "Affirmative. Use code CAMPUS30 for orders above ₹500 involving 5+ members." },
              { q: "How does the AI Savor tool work?", a: "The Savor Hub utilizes the Gemini 1.5 Flash node to analyze your environment." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none bg-white dark:bg-zinc-900 rounded-[1.5rem] px-6 md:px-8 shadow-md hover:shadow-lg transition-all overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <AccordionTrigger className="font-black text-sm md:text-base hover:no-underline py-5 md:py-6 text-left uppercase tracking-tight group">
                   <div className="flex items-center gap-3">
                      <span className="text-primary italic opacity-40">0{i+1}</span>
                      {faq.q}
                   </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 text-xs md:text-sm font-medium leading-relaxed italic border-t border-dashed pt-4 opacity-80">"{faq.a}"</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      {/* PREMIUM FOOTER HUB */}
      <footer className="bg-zinc-50 dark:bg-zinc-900/50 border-t pt-16 pb-10 rounded-t-[3rem] md:rounded-t-[5rem]">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16">
            <div className="space-y-6">
              <Logo size="sm" className="scale-110 origin-left" />
              <p className="text-muted-foreground leading-relaxed text-sm font-medium italic opacity-70">"Culinary engineering meets hyper-fidelity delivery. Experience the future of campus fast food."</p>
              <div className="flex gap-3">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-800 shadow-sm border flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer group/icon">
                      <Zap className="w-4 h-4 opacity-40 group-hover/icon:opacity-100" />
                   </div>
                 ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-primary">Operational Hubs</h4>
              <ul className="space-y-3 text-muted-foreground font-black text-[9px] uppercase tracking-widest">
                <li><Link href="/menu" className="hover:text-primary transition-colors flex items-center gap-2.5"><ArrowRight className="w-3 h-3" /> Menu Catalog</Link></li>
                <li><Link href="/orders" className="hover:text-primary transition-colors flex items-center gap-2.5"><ArrowRight className="w-3 h-3" /> Order Ledger</Link></li>
                <li><Link href="/favorites" className="hover:text-primary transition-colors flex items-center gap-2.5"><ArrowRight className="w-3 h-3" /> Identity Wishlist</Link></li>
                <li><Link href="/addresses" className="hover:text-primary transition-colors flex items-center gap-2.5"><ArrowRight className="w-3 h-3" /> Delivery Nodes</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-primary">Support Frequency</h4>
              <ul className="space-y-3 text-muted-foreground font-black text-[9px] uppercase tracking-widest">
                <li><Link href="/support" className="hover:text-primary transition-colors flex items-center gap-2.5"><ArrowRight className="w-3 h-3" /> AI Support Hub</Link></li>
                <li><Link href="/settings" className="hover:text-primary transition-colors flex items-center gap-2.5"><ArrowRight className="w-3 h-3" /> Configuration</Link></li>
                <li><Link href="/admin/login" className="hover:text-primary transition-colors flex items-center gap-2.5"><ArrowRight className="w-3 h-3" /> Staff Terminal</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
               <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-primary">Status Registry</h4>
               <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[1.8rem] space-y-3 shadow-inner">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Operational</span>
                  </div>
                  <p className="text-[8px] font-bold text-emerald-700/60 uppercase leading-tight tracking-tight">System v5.2 active. All delivery vectors in sector are unblocked.</p>
                  <Link href="/menu" className="block">
                     <Button size="sm" className="w-full rounded-lg bg-emerald-600 text-white font-black uppercase text-[8px] h-8 tracking-widest">Order Now</Button>
                  </Link>
               </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.4em] opacity-30">© {new Date().getFullYear()} SAVORA • QUANTUM FOOD-TECH</p>
            <div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-30">
               <Link href="/policy/privacy" className="hover:text-primary transition-colors">Privacy</Link>
               <Link href="/policy/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
