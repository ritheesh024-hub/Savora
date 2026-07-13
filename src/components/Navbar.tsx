"use client"
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  History, 
  LayoutDashboard, 
  Search,
  Heart,
  Home,
  Utensils,
  MapPin,
  TicketPercent,
  Settings,
  Bell,
  ShoppingBag,
  Menu,
  LifeBuoy,
  User,
  LogOut,
  ChevronDown,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUser, useAuth, useFirestore, useDoc } from '@/firebase';
import { AuthModal } from './AuthModal';
import { CartDrawer } from './CartDrawer';
import { NotificationCenter } from './NotificationCenter';
import { useStore } from '@/app/lib/store';
import { doc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Logo } from './Logo';
import { useNotifications } from '@/hooks/use-notifications';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from '@/hooks/use-toast';

interface NavbarProps {
  isIntegrated?: boolean;
}

export const Navbar = ({ isIntegrated = false }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { cart, isDarkMode } = useStore();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const adminDocRef = useMemo(() => user && db ? doc(db, 'admins', user.uid) : null, [user, db]);
  const { data: adminProfile } = useDoc(adminDocRef);

  const isStaff = !!adminProfile || user?.email === "meruguritheesh09@gmail.com";

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
      toast({ title: "Logged Out", description: "Identity session terminated." });
      router.push('/');
      setIsMenuOpen(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/menu?q=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  const isHeroState = pathname === '/' && !scrolled;

  return (
    <nav className={cn(
      "fixed left-0 right-0 z-50 transition-all duration-700 ease-in-out px-4 md:px-8",
      isHeroState ? "top-3 md:top-6 lg:top-8" : (scrolled ? "top-0 py-3" : "top-0 py-6")
    )}>
      <div className={cn(
        "container mx-auto max-w-7xl h-[72px] md:h-[80px] flex items-center justify-between gap-6 px-6 md:px-10 transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem]",
        scrolled 
          ? "bg-white/80 dark:bg-black/80 backdrop-blur-3xl border border-white/20 dark:border-white/5 shadow-3xl" 
          : (isHeroState ? "bg-white/5 backdrop-blur-md border border-white/10" : "bg-white/10 backdrop-blur-md border border-white/10")
      )}>
        {/* LOGO NODE */}
        <Link href="/" className="transition-transform active:scale-95 shrink-0">
          <Logo size="sm" variant={isHeroState ? 'light' : (isDarkMode ? 'light' : 'dark')} />
        </Link>

        {/* PREMIUM SEARCH ENGINE */}
        <div className={cn(
          "flex-1 max-w-lg hidden lg:block transition-all duration-500",
          isSearchFocused ? "scale-105" : "scale-100"
        )}>
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className={cn(
              "absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors z-10",
              isHeroState ? "text-white/40" : "text-muted-foreground/40",
              isSearchFocused && "text-primary"
            )} />
            <Input 
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search your favourite food..." 
              className={cn(
                "w-full h-12 pl-14 pr-12 rounded-full border-none transition-all font-bold text-sm shadow-inner",
                isHeroState 
                  ? "bg-white/10 !text-white placeholder:text-white/40 hover:bg-white/20" 
                  : "bg-secondary/60 dark:bg-zinc-900 !text-foreground",
                isSearchFocused && "ring-4 ring-primary/20 bg-white dark:bg-zinc-800 !text-black dark:!text-white"
              )}
            />
            <Mic className={cn(
              "absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 opacity-40 hover:text-primary cursor-pointer transition-colors",
              isHeroState ? "text-white" : "text-foreground"
            )} />
          </form>
        </div>

        {/* ACTION NODES */}
        <div className="flex items-center gap-3 md:gap-4">
          {mounted && user && (
            <NotificationCenter>
              <button type="button" className={cn(
                "w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all relative border border-transparent",
                isHeroState ? "bg-white/10 text-white hover:bg-white/20" : "bg-secondary/60 dark:bg-zinc-900 text-foreground hover:bg-primary/5 hover:border-primary/20"
              )}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </button>
            </NotificationCenter>
          )}

          <CartDrawer>
            <button type="button" className={cn(
              "w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all relative border border-transparent",
              isHeroState ? "bg-white/10 text-white hover:bg-white/20" : "bg-secondary/60 dark:bg-zinc-900 text-foreground hover:bg-primary/5 hover:border-primary/20"
            )}>
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">
                  {cart.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              )}
            </button>
          </CartDrawer>

          {mounted && (
            user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={cn(
                    "hidden md:flex items-center gap-3 p-1.5 pl-2 pr-4 rounded-full transition-all border group",
                    isHeroState ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-secondary/60 dark:bg-zinc-900 border-transparent hover:bg-secondary"
                  )}>
                    <Avatar className="h-8 w-8 border-2 border-primary shadow-xl group-hover:scale-105 transition-transform">
                      <AvatarImage src={user.photoURL || ''} />
                      <AvatarFallback className="text-[10px] font-black bg-primary text-white">{user.displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                       <span className={cn("text-[10px] font-black uppercase tracking-tight leading-none mb-0.5", isHeroState ? "text-white" : "text-foreground")}>{user.displayName?.split(' ')[0]}</span>
                       <span className={cn("text-[8px] font-bold opacity-40 uppercase", isHeroState ? "text-white" : "text-foreground")}>Authenticated</span>
                    </div>
                    <ChevronDown className={cn("w-3.5 h-3.5 opacity-40", isHeroState ? "text-white" : "text-foreground")} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 shadow-4xl border-none mt-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl">
                  <DropdownMenuLabel className="text-[9px] font-black uppercase opacity-40 px-3 py-2">Profile Matrix</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => router.push('/settings')} className="rounded-xl gap-4 py-3.5 font-bold cursor-pointer hover:bg-primary/5">
                    <User className="w-4.5 h-4.5 text-primary" /> Profile Details
                  </DropdownMenuItem>
                  {isStaff && (
                    <DropdownMenuItem onSelect={() => router.push('/admin/dashboard')} className="rounded-xl gap-4 py-3.5 font-bold cursor-pointer hover:bg-primary/5">
                      <LayoutDashboard className="w-4.5 h-4.5 text-blue-500" /> Staff Console
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="opacity-10" />
                  <DropdownMenuItem onSelect={handleLogout} className="rounded-xl gap-4 py-3.5 font-bold text-rose-600 cursor-pointer hover:bg-rose-50">
                    <LogOut className="w-4.5 h-4.5" /> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button type="button" className={cn(
                  "h-12 rounded-full px-8 font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl hover:scale-[1.02] transition-all border-none",
                  isHeroState ? "bg-white text-black" : "bg-orange-gradient text-white"
                )}>
                  <User className="w-4 h-4" /> login
                </Button>
              </Link>
            )
          )}

          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button type="button" className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-90",
                  isHeroState ? "bg-white/10 text-white hover:bg-white/20" : "bg-secondary/60 dark:bg-zinc-900 text-foreground"
                )}>
                  <Menu className="w-5.5 h-5.5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[310px] p-0 border-none bg-background flex flex-col z-[60] shadow-4xl rounded-l-[3rem]">
                 <SheetHeader className="p-0 border-none">
                   <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                   <SheetDescription className="sr-only">Access your profile and orders.</SheetDescription>
                 </SheetHeader>

                 <div className="p-8 border-b bg-zinc-50 dark:bg-zinc-900/50 flex flex-col gap-6">
                    {user ? (
                      <div className="flex items-center gap-5">
                        <Avatar className="h-16 w-16 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-2xl">
                          <AvatarImage src={user.photoURL || ''} />
                          <AvatarFallback className="text-xl font-black bg-primary text-white">{user.displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-[9px] font-black uppercase text-primary tracking-[0.2em] leading-none mb-1.5">Authenticated</p>
                          <h3 className="text-xl font-black uppercase tracking-tighter truncate leading-none">{user.displayName}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-black font-headline uppercase tracking-tighter italic leading-none">Welcome <span className="text-primary">Biter!</span></h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sign in for premium perks.</p>
                        </div>
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                          <Button type="button" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] bg-primary shadow-xl shadow-primary/20 gap-3">
                             Launch Account <ChevronDown className="w-4 h-4 -rotate-90" />
                          </Button>
                        </Link>
                      </div>
                    )}
                 </div>

                 <div className="flex-1 overflow-y-auto py-8 px-5 space-y-2">
                    {[
                      { label: 'Home', href: '/', icon: Home },
                      { label: 'Menu Selection', href: '/menu', icon: Utensils },
                      { label: 'Live History', href: '/orders', icon: History, authRequired: true },
                      { label: 'Help & Support', href: '/support', icon: LifeBuoy, authRequired: true },
                      { label: 'Favorites', href: '/favorites', icon: Heart, authRequired: true },
                      { label: 'Saved Addresses', href: '/addresses', icon: MapPin, authRequired: true },
                      { label: 'Coupons & Offers', href: '/coupons', icon: TicketPercent },
                      { label: 'Staff Console', href: '/admin/dashboard', icon: LayoutDashboard, authRequired: true, staffOnly: true },
                      { label: 'Settings', href: '/settings', icon: Settings, authRequired: true },
                    ].map((item) => {
                      if (item.authRequired && !user) return null;
                      if (item.staffOnly && !isStaff) return null;
                      return (
                        <Link key={item.label} href={item.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-5 p-4.5 rounded-2xl hover:bg-primary/5 group transition-all">
                          <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <span className="font-black text-[10px] uppercase tracking-[0.15em] text-foreground/80 group-hover:text-primary">{item.label}</span>
                        </Link>
                      );
                    })}
                 </div>

                 {user && (
                   <div className="p-8 border-t border-dashed">
                      <button type="button" onClick={handleLogout} className="flex items-center justify-center gap-4 w-full h-14 rounded-2xl bg-rose-50 text-rose-600 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-rose-100 transition-colors">
                        <LogOut className="w-4.5 h-4.5" /> Terminate Session
                      </button>
                   </div>
                 )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};
