
'use client';

import React, { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Heart, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FoodCard } from '@/components/FoodCard';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent('/favorites')}`);
    }
  }, [user, userLoading, router]);

  const favQuery = React.useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'favorites'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user]);

  const { data: favorites, loading: favLoading } = useCollection<any>(favQuery);

  if (userLoading || (user && favLoading)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-black uppercase text-[10px] tracking-widest opacity-40">Syncing Wishlist...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-20 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary shadow-inner">
              <Heart className="w-7 h-7 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black font-headline uppercase tracking-tighter">My <span className="text-primary italic">Favorites.</span></h1>
              <p className="text-muted-foreground text-xs md:text-sm font-medium tracking-tight mt-1">Your curated collection of premium bites.</p>
            </div>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="py-32 text-center space-y-8 bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed shadow-3xl">
            <div className="w-24 h-24 bg-secondary dark:bg-zinc-800 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-10 h-10 text-muted-foreground opacity-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Wishlist <span className="text-primary italic">Empty</span></h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto font-medium">Tap the heart on any dish to add it to your premium collection.</p>
            </div>
            <Link href="/menu">
              <Button className="rounded-full px-12 h-16 font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-primary/20 bg-primary group">
                Browse Menu <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            {favorites.map((fav: any, idx: number) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <FoodCard item={fav.product} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
