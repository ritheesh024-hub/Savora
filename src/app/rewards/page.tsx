
'use client';

import React, { useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  Wallet, 
  Gift, 
  ArrowRight, 
  History, 
  Star, 
  Loader2, 
  Sparkles, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Send 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function RewardsPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const [copied, setCopied] = React.useState(false);

  const userDocRef = useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: profile, loading: profileLoading } = useDoc<any>(userDocRef);

  if (userLoading || profileLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
       <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
         <Navbar />
         <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-24">
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mb-8 shadow-inner">
               <Wallet className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Coin Reserve <span className="text-primary italic">Locked</span></h2>
            <p className="text-muted-foreground text-sm max-w-xs mt-3 mb-8">Sign in to access your referral engine and elite reward ledger.</p>
            <Button className="rounded-full px-12 h-16 font-black uppercase text-[11px] tracking-widest bg-primary" onClick={() => window.location.href = '/'}>Unlock Gateway</Button>
         </main>
       </div>
    );
  }

  const coins = profile?.rewardCoins || 0;
  const nextMilestone = 500;
  const progress = Math.min((coins / nextMilestone) * 100, 100);
  const referralCode = `EB-${user.uid.slice(0, 6).toUpperCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: "Code Copied!", description: "Share this to earn 50 coins." });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const text = `Hey! Use my referral code ${referralCode} on Ezzy Bites to get ₹50 OFF on your first order. Order here: ${window.location.origin}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 max-w-4xl">
        <div className="space-y-10">
          {/* COIN CARD */}
          <div className="bg-orange-gradient p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-10 transform group-hover:scale-110 transition-transform duration-1000 rotate-12">
               <Wallet className="w-48 h-48" />
             </div>
             <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3 bg-white/20 w-fit px-5 py-2 rounded-full backdrop-blur-md border border-white/10">
                   <Sparkles className="w-4 h-4 text-yellow-300" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ezzy Elite Member</span>
                </div>
                <div>
                   <p className="text-[11px] font-black uppercase tracking-[0.4em] opacity-70 mb-2">Available Balance</p>
                   <h1 className="text-7xl font-black font-headline italic leading-none">{coins} <span className="text-xl non-italic opacity-60">Coins</span></h1>
                </div>
                <div className="space-y-3 max-w-md">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className="opacity-80">Progress to Tier 2</span>
                      <span>{nextMilestone - coins} more for 15% OFF</span>
                   </div>
                   <Progress value={progress} className="h-2.5 bg-white/20" />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
             {/* REFERRAL ENGINE */}
             <Card className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-10 space-y-10 border overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Share2 className="w-32 h-32" /></div>
                <div className="space-y-2 relative z-10">
                   <h3 className="text-3xl font-black font-headline uppercase tracking-tighter">Refer & <span className="text-primary italic">Earn.</span></h3>
                   <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                     Give ₹50 to a friend and get <span className="text-primary font-black">50 Coins</span> back when they order.
                   </p>
                </div>

                <div className="space-y-6 relative z-10">
                   <div className="p-1 bg-secondary/50 rounded-[2rem] border-2 border-dashed border-muted flex items-center gap-2 group">
                      <div className="flex-1 px-8 py-4">
                         <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Your Identity Node</p>
                         <p className="text-xl font-black font-mono tracking-tighter uppercase text-primary">{referralCode}</p>
                      </div>
                      <Button 
                        onClick={handleCopy}
                        className={cn(
                          "h-16 w-16 rounded-[1.8rem] transition-all",
                          copied ? "bg-emerald-600 text-white" : "bg-zinc-950 text-white hover:bg-primary"
                        )}
                      >
                        {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                      </Button>
                   </div>

                   <div className="flex gap-4">
                      <Button onClick={shareViaWhatsApp} className="flex-1 h-14 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black uppercase text-[10px] tracking-widest gap-3 shadow-xl">
                        <MessageCircle className="w-5 h-5" /> WhatsApp
                      </Button>
                      <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-2 gap-3 hover:bg-primary/5">
                        <Share2 className="w-4 h-4" /> More Options
                      </Button>
                   </div>
                </div>
             </Card>

             {/* STATS & HISTORY */}
             <div className="space-y-8">
                <Card className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8 flex items-center justify-between border">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                         <Star className="w-7 h-7 fill-current" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Total Earnings</p>
                         <h4 className="text-2xl font-black uppercase tracking-tight italic">{profile?.totalCoinsEarned || coins} Coins</h4>
                      </div>
                   </div>
                   <Button variant="ghost" className="h-10 px-4 rounded-xl font-black uppercase text-[8px] tracking-widest gap-2 text-primary hover:bg-primary/5">Ledger <History className="w-3.5 h-3.5" /></Button>
                </Card>

                <div className="space-y-4">
                   <h3 className="font-black uppercase tracking-widest text-[10px] ml-4 opacity-40">Operational Protocol</h3>
                   {[
                     { icon: Star, title: "Order & Accrue", desc: "Collect 5 coins for every ₹100 spent in any node." },
                     { icon: Wallet, title: "Instant Settle", desc: "Redeem coins at checkout for flat unit discounts." },
                     { icon: Gift, title: "Force Growth", desc: "Unlock 50 coins instantly for each verified first-order recruit." }
                   ].map((item, i) => (
                     <div key={i} className="flex gap-5 p-5 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-border/50 group hover:border-primary/20 transition-all">
                        <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                           <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                           <h4 className="font-black text-sm uppercase tracking-tight mb-0.5">{item.title}</h4>
                           <p className="text-xs text-muted-foreground font-medium italic opacity-60">"{item.desc}"</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

