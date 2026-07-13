'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore, OrderType } from '@/app/lib/store';
import { 
  Utensils, 
  ShoppingBag, 
  Truck, 
  ArrowRight,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function QRScanLandingPage() {
  const router = useRouter();
  const { setOrderType, selectedOrderType } = useStore();

  const handleSelectType = (type: OrderType) => {
    setOrderType(type);
    router.push('/menu');
  };

  const options = [
    { 
      id: 'Dine-In' as OrderType, 
      label: 'Dine In', 
      desc: 'Eat right here in our sanctuary', 
      icon: Utensils, 
      color: 'bg-primary' 
    },
    { 
      id: 'Take Away' as OrderType, 
      label: 'Takeaway', 
      desc: 'Quick pickup for on-the-go', 
      icon: ShoppingBag, 
      color: 'bg-blue-600' 
    },
    { 
      id: 'Delivery' as OrderType, 
      label: 'Delivery', 
      desc: 'Delivered to your doorstep', 
      icon: Truck, 
      color: 'bg-emerald-600' 
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-20 opacity-5">
        <Zap className="w-96 h-96 text-primary rotate-12" />
      </div>

      <div className="max-w-md w-full space-y-12 relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Logo size="lg" hideText className="mx-auto" />
          <div className="space-y-2">
            <h1 className="text-4xl font-black font-headline uppercase tracking-tighter">
              👋 Welcome to <span className="text-primary italic">EzzyBites</span>
            </h1>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-60">
              Order directly from your phone.
            </p>
          </div>
        </motion.div>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 text-center">Select Order Type</p>
          <div className="grid gap-3">
            {options.map((opt, idx) => (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <button
                  onClick={() => handleSelectType(opt.id)}
                  className="w-full text-left group p-5 bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-transparent hover:border-primary/20 shadow-sm hover:shadow-xl transition-all flex items-center gap-5 relative overflow-hidden"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transform group-hover:scale-110 transition-transform",
                    opt.color
                  )}>
                    <opt.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-lg uppercase tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">{opt.label}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{opt.desc}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-8 flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-4 py-2 px-6 bg-white dark:bg-zinc-950 rounded-full border shadow-sm">
             <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-[8px] font-black uppercase tracking-widest">Secure Payment</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-border" />
             <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                <span className="text-[8px] font-black uppercase tracking-widest">Authorized Hub</span>
             </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary/30">
            Ezzy Bites • Quantum Ordering v5.0
          </p>
        </motion.div>
      </div>
    </div>
  );
}