'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence, signOut } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Loader2, ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/use-analytics';
import { Logo } from '@/components/Logo';

function LoginContent() {
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { trackLogin, trackSignup } = useAnalytics();

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const PRIMARY_ADMIN_EMAIL = "meruguritheesh09@gmail.com";
      
      // Strict separation check
      if (user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL) {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Restricted",
          description: "This admin account is only authorized in the Staff Console Hub.",
        });
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoUrl: user.photoURL,
          orderCount: 0,
          role: 'customer',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
        trackSignup('google');
      } else {
        await setDoc(userRef, { 
          lastLoginAt: serverTimestamp(),
          photoUrl: user.photoURL || userSnap.data().photoUrl 
        }, { merge: true });
        trackLogin('google');
      }

      toast({ title: "Welcome back!", description: `Signed in as ${user.displayName?.split(' ')[0]}` });
      router.push(redirectPath);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        toast({ variant: "destructive", title: "Login Failed", description: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 pt-24 md:pt-32">
        <Card className="w-full max-w-md rounded-[2.5rem] border-none shadow-3xl bg-white dark:bg-zinc-900 overflow-hidden animate-in zoom-in-95 duration-500">
          <CardHeader className="text-center pt-12 pb-8 space-y-6">
            <Logo size="lg" hideText className="mx-auto" />
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black font-headline uppercase tracking-tighter italic leading-none">Identity <span className="text-primary">Gateway</span></CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Access your premium bites account</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10 space-y-8">
            <Button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-16 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-black hover:scale-[1.02] transition-all font-black uppercase text-[10px] tracking-widest gap-4 shadow-xl active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.61-1.48 2.53-3.66 2.53-6.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-4 py-2 justify-center opacity-20">
               <span className="h-px bg-zinc-400 flex-1" />
               <span className="text-[8px] font-black uppercase tracking-widest">Zero Trust Auth</span>
               <span className="h-px bg-zinc-400 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="flex flex-col items-center gap-2 p-5 bg-secondary/30 rounded-3xl text-center border border-transparent hover:border-primary/10 transition-all">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  <p className="text-[8px] font-black uppercase tracking-widest leading-none">Safe Signal</p>
               </div>
               <div className="flex flex-col items-center gap-2 p-5 bg-secondary/30 rounded-3xl text-center border border-transparent hover:border-primary/10 transition-all">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  <p className="text-[8px] font-black uppercase tracking-widest leading-none">Smart History</p>
               </div>
            </div>
          </CardContent>
          <CardFooter className="bg-zinc-50 dark:bg-zinc-800/50 p-8 flex justify-center border-t border-dashed">
             <button type="button" onClick={() => router.back()} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Previous Node
             </button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
