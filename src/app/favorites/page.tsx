'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Heart, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FoodCard } from '@/components/FoodCard';

export default function FavoritesPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();

  const favQuery = React.useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'favorites'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: favorites, loading: favLoading } = useCollection<any>(favQuery);

  if (userLoading || favLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-black uppercase text-[10px] tracking-widest opacity-40">Loading Favorites...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-black font-headline uppercase tracking-tighter">My <span className="text-primary italic">Favorites</span></h1>
              <p className="text-muted-foreground text-sm font-medium">Items you've bookmarked for quick ordering.</p>
            </div>
          </div>

          {!user ? (
             <div className="py-20 text-center space-y-6 bg-secondary/10 rounded-[3rem] border-2 border-dashed">
                <Heart className="w-16 h-16 text-muted-foreground opacity-20 mx-auto" />
                <h3 className="text-xl font-black uppercase">Sign In to Save Favorites</h3>
                <Link href="/">
                  <Button className="rounded-full px-8 h-12 font-black uppercase text-[10px] tracking-widest bg-primary">Back to Home</Button>
                </Link>
             </div>
          ) : favorites.length === 0 ? (
            <div className="py-20 text-center space-y-6 bg-secondary/10 rounded-[3rem] border-2 border-dashed">
              <div className="w-20 h-20 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <ShoppingBag className="w-8 h-8 text-muted-foreground opacity-20" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Your favorite list is empty</h3>
                <p className="text-muted-foreground text-sm mt-1">Tap the heart icon on any dish to add it here.</p>
              </div>
              <Link href="/menu">
                <Button className="rounded-full px-10 h-14 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 bg-primary">Browse Menu</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <FoodCard key={fav.id} item={fav.product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
