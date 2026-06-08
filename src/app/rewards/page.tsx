'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Wallet, Gift, ArrowRight, History, Star, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function RewardsPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const userDocRef = React.useMemo(() => user && db ? doc(db, 'users', user.uid) : null, [user, db]);
  const { data: profile, loading: profileLoading } = useDoc(userDocRef);

  if (userLoading || profileLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  const coins = profile?.rewardCoins || 0;
  const nextMilestone = 500;
  const progress = Math.min((coins / nextMilestone) * 100, 100);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950">
      <Navbar />
      <main className="container mx-auto px-4 pt-16 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-orange-gradient p-8 rounded-[2.5rem] text-white shadow-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10"><Wallet className="w-32 h-32" /></div>
             <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-md">
                   <Sparkles className="w-4 h-4 text-yellow-300" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Ezzy Elite Member</span>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Available Balance</p>
                   <h1 className="text-5xl font-black font-headline italic">{coins} Coins</h1>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[9px] font-black uppercase">
                      <span>Next Tier: 500</span>
                      <span>{nextMilestone - coins} more to unlock</span>
                   </div>
                   <Progress value={progress} className="h-2 bg-white/20" />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 flex flex-col items-center text-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Gift className="w-5 h-5" /></div>
                <div>
                   <h4 className="font-black text-xs uppercase">Redeem Coins</h4>
                   <p className="text-[9px] text-muted-foreground mt-1">Convert coins into instant discounts.</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl h-10 font-black text-[9px] uppercase tracking-widest">Select Offer</Button>
             </Card>
             <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 flex flex-col items-center text-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><History className="w-5 h-5" /></div>
                <div>
                   <h4 className="font-black text-xs uppercase">Coin History</h4>
                   <p className="text-[9px] text-muted-foreground mt-1">View your earning and spending history.</p>
                </div>
                <Button variant="outline" className="w-full rounded-xl h-10 font-black text-[9px] uppercase tracking-widest">View Ledger</Button>
             </Card>
          </div>

          <div className="space-y-4">
             <h3 className="font-black uppercase tracking-widest text-[10px] ml-4 opacity-40">How it works</h3>
             {[
               { icon: Star, title: "Order & Earn", desc: "Get 5 coins for every ₹100 spent on any dish." },
               { icon: Wallet, title: "Easy Redemption", desc: "Use coins at checkout for flat cash discounts." },
               { icon: Gift, title: "Refer Friends", desc: "Get 50 coins instantly when a friend places their first order." }
             ].map((item, i) => (
               <div key={i} className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-border/50">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                     <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                     <h4 className="font-bold text-sm">{item.title}</h4>
                     <p className="text-xs text-muted-foreground font-medium">{item.desc}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </main>
    </div>
  );
}
