
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  ShoppingBag, Lock, Mail, Loader2, ArrowRight, 
  ShieldCheck, Receipt, ChefHat, 
  ChevronLeft, Eye, EyeOff, Home
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { doc, getDoc, collection, query, where, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type LoginStep = 'selection' | 'auth';
type SelectedRole = 'admin' | 'cashier' | 'kitchen';

export default function AdminLoginPage() {
  const [step, setStep] = useState<LoginStep>('selection');
  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null);
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [systemChecked, setSystemChecked] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const PRIMARY_ADMIN_EMAIL = "meruguritheesh09@gmail.com";

  useEffect(() => {
    async function checkExistingAuth() {
      if (!userLoading && user && db) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.data();
          
          if (user.email === PRIMARY_ADMIN_EMAIL || (userData && userData.role === 'admin' && userData.status === 'active')) {
            router.push('/admin/dashboard');
          }
        } catch (e) {
          console.error("Auth check failed:", e);
        }
      }
      setSystemChecked(true);
    }
    checkExistingAuth();
  }, [user, userLoading, router, db]);

  const handleRoleSelect = (role: SelectedRole) => {
    setSelectedRole(role);
    setStep('auth');
    if (role === 'admin') {
      setEmailOrId(PRIMARY_ADMIN_EMAIL);
    } else {
      setEmailOrId('');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      let targetEmail = emailOrId.trim().toLowerCase();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail);

      // --- ADMIN ID LOOKUP PROTOCOL ---
      if (!isEmail) {
        const q = query(collection(db, 'users'), where('employeeId', '==', targetEmail));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          targetEmail = querySnapshot.docs[0].data().email;
        } else {
          // Fallback check in legacy admins collection
          const qLegacy = query(collection(db, 'admins'), where('employeeId', '==', targetEmail));
          const legacySnap = await getDocs(qLegacy);
          if (!legacySnap.empty) {
            targetEmail = legacySnap.docs[0].data().email;
          } else {
            toast({ variant: "destructive", title: "Authentication Failed", description: "Invalid email or password." });
            setLoading(false);
            return;
          }
        }
      }

      // --- FIREBASE AUTH HANDSHAKE ---
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
      const uid = userCredential.user.uid;

      // --- ROLE & STATUS VERIFICATION NODE ---
      const userRef = doc(db, 'users', uid);
      let userSnap = await getDoc(userRef);
      let userData = userSnap.data();

      // Master Admin Seeding / Force Check
      if (targetEmail === PRIMARY_ADMIN_EMAIL) {
        if (!userData || userData.role !== 'admin' || userData.status !== 'active') {
          const seedData = {
            uid: uid,
            email: PRIMARY_ADMIN_EMAIL,
            role: 'admin',
            status: 'active',
            name: 'Master Admin',
            updatedAt: serverTimestamp(),
            createdAt: userData?.createdAt || serverTimestamp()
          };
          await setDoc(userRef, seedData, { merge: true });
          userData = seedData;
        }
      }

      if (!userData || (selectedRole === 'admin' && userData.role !== 'admin' && targetEmail !== PRIMARY_ADMIN_EMAIL)) {
        await signOut(auth);
        toast({ variant: "destructive", title: "Authentication Failed", description: "Invalid email or password." });
        setLoading(false);
        return;
      }

      if (userData.status === 'disabled' || userData.status === 'inactive') {
        await signOut(auth);
        toast({ variant: "destructive", title: "Access Revoked", description: "Your account has been disabled." });
        setLoading(false);
        return;
      }

      // Record successful login
      await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      
      toast({ title: "Authorized", description: `Welcome back, ${userData.name || 'Admin'}.` });
      router.push('/admin/dashboard');

    } catch (error: any) {
      let message = "Invalid email or password.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Invalid email or password.";
      } else if (error.message) {
        message = error.message;
      }
      toast({ variant: "destructive", title: "Authentication Failed", description: message });
    } finally {
      setLoading(false);
    }
  };

  if (!systemChecked) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  if (step === 'selection') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="text-center mb-12 space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto transform rotate-12 shadow-2xl shadow-primary/20">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black font-headline tracking-tighter">Ezzy<span className="text-primary italic">Ops</span></h1>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.3em]">Operational Access Hub</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
          <RoleCard icon={ShieldCheck} title="Master Admin" desc="Platform control & analytics" color="bg-primary" onClick={() => handleRoleSelect('admin')} />
          <RoleCard icon={Receipt} title="Counter Cashier" desc="POS & Billing operations" color="bg-blue-600" onClick={() => handleRoleSelect('cashier')} />
          <RoleCard icon={ChefHat} title="Kitchen Station" desc="Live cooking & dispatch" color="bg-orange-500" onClick={() => handleRoleSelect('kitchen')} />
        </div>

        <Link href="/">
          <Button variant="ghost" className="rounded-full h-14 px-10 gap-3 font-black uppercase text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-all">
            <Home className="w-4 h-4" /> Return to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md rounded-[2.5rem] border shadow-2xl bg-card overflow-hidden">
        <div className={cn("h-2 w-full", selectedRole === 'admin' ? "bg-primary" : selectedRole === 'cashier' ? "bg-blue-600" : "bg-orange-500")} />
        
        <CardHeader className="space-y-2 text-center pb-6 pt-10 relative">
          <button onClick={() => setStep('selection')} className="absolute left-6 top-8 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-black uppercase">
            <ChevronLeft className="w-3 h-3" /> Back
          </button>
          
          <div className="flex justify-center mb-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", selectedRole === 'admin' ? "bg-primary" : selectedRole === 'cashier' ? "bg-blue-600" : "bg-orange-500")}>
              {selectedRole === 'admin' && <ShieldCheck className="w-6 h-6 text-white" />}
              {selectedRole === 'cashier' && <Receipt className="w-6 h-6 text-white" />}
              {selectedRole === 'kitchen' && <ChefHat className="w-6 h-6 text-white" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-black font-headline uppercase tracking-tighter">{selectedRole?.toUpperCase()} Login</CardTitle>
          <CardDescription className="font-bold text-[10px] uppercase tracking-widest opacity-60">Credential Verification</CardDescription>
        </CardHeader>

        <form onSubmit={handleAuth}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Admin ID or Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder={selectedRole === 'admin' ? "Admin ID or Email" : "Employee ID or Email"} 
                  className="h-14 pl-12 rounded-xl font-bold bg-secondary/20" 
                  value={emailOrId} 
                  onChange={(e) => setEmailOrId(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Password</Label>
                <button type="button" onClick={() => {
                  if (auth && emailOrId.includes('@')) {
                    sendPasswordResetEmail(auth, emailOrId).then(() => toast({ title: "Reset Sent", description: "Check your email." }));
                  } else {
                    toast({ variant: "destructive", title: "Email Required", description: "Enter your email to reset password." });
                  }
                }} className="text-[9px] font-black text-primary uppercase hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  className="h-14 pl-12 pr-12 rounded-xl bg-secondary/20 font-bold" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={6} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pb-10 pt-4 px-8">
            <Button type="submit" className={cn("w-full h-16 rounded-2xl font-black text-lg shadow-xl text-white", selectedRole === 'admin' ? "bg-primary" : selectedRole === 'cashier' ? "bg-blue-600" : "bg-orange-500")} disabled={loading}>
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <div className="flex items-center gap-3"><span>Enter Hub</span><ArrowRight className="w-5 h-5" /></div>}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function RoleCard({ icon: Icon, title, desc, color, onClick }: any) {
  return (
    <Card onClick={onClick} className="group rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer bg-card">
      <CardContent className="p-8 space-y-6 text-center">
        <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all mx-auto", color)}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black font-headline uppercase tracking-tighter">{title}</h3>
          <p className="text-xs font-medium text-muted-foreground leading-relaxed">{desc}</p>
        </div>
        <div className="pt-4 flex items-center justify-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-all">
          Select <ArrowRight className="w-3 h-3" />
        </div>
      </CardContent>
    </Card>
  );
}
