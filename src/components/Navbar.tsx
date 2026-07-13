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
  Mic,
  Moon,
  Sun,
  ArrowRight
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
import { ThemeToggle } from './ThemeToggle';

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
  const { cart, isDarkMode, toggleDarkMode } = useStore();
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
      scrolled ? "top-0 py-3" : "top-0 py-6"
    )}>
      <div className={cn(
        "container mx-auto max-w-7xl h-[60px] md:h-[68px] flex items-center justify-between gap-6 px-6 md:px-10 transition-all duration-500 rounded-[2.5rem] md:rounded-[3rem]",
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
              placeholder="Search your favorite bites..." 
              className={cn(
                "w-full h-11 pl-14 pr-12 rounded-full border-none transition-all font-bold text-sm shadow-inner",
                isHeroState 
                  ? "bg-white/10 !text-white placeholder:text-white/40 hover:bg-white/20" 
                  : "bg-secondary/60 dark:bg-zinc-900 !text-foreground",
                isSearchFocused && "ring-8 ring-primary/10 bg-white dark:bg-zinc-800 !text-black dark:!text-white"
              )}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
               <Mic className={cn(
                 "w-4 h-4 opacity-40 hover:text-primary cursor-pointer transition-colors",
                 isHeroState ? "text-white" : "text-foreground"
               )} />
            </div>
          </form>
        </div>

        {/* ACTION NODES */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* THEME TOGGLE */}
          <div className="hidden sm:block">
            <ThemeToggle className={cn(
              "w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all border border-transparent",
              isHeroState ? "bg-white/10 text-white hover:bg-white/20" : "bg-secondary/60 dark:bg-zinc-900 text-foreground hover:bg-primary/5 hover:border-primary/20"
            )} />
          </div>

          {mounted && user && (
            <NotificationCenter>
              <button type="button" className={cn(
                "w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all relative border border-transparent",
                isHeroState ? "bg-white/10 text-white hover:bg-white/20" : "bg-secondary/60 dark:bg-zinc-900 text-foreground hover:bg-primary/5 hover:border-primary/20"
              )}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </button>
            </NotificationCenter>
          )}

          <CartDrawer>
            <button type="button" className={cn(
              "w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all relative border border-transparent",
              isHeroState ? "bg-white/10 text-white hover:bg-white/20" : "bg-secondary/60 dark:bg-zinc-900 text-foreground hover:bg-primary/5 hover:border-primary/20"
            )}>
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">
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
                    "hidden md:flex items-center gap-3 p-1 rounded-full transition-all border group",
                    isHeroState ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-secondary/60 dark:bg-zinc-900 border-transparent hover:bg-secondary"
                  )}>
                    <Avatar className="h-9 w-9 border-2 border-primary shadow-xl group-hover:scale-105 transition-transform">
                      <AvatarImage src={user.photoURL || ''} />
                      <AvatarFallback className="text-[10px] font-black bg-primary text-white">{user.displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left pr-2">
                       <span className={cn("text-[11px] font-black uppercase tracking-tight leading-none mb-0.5", isHeroState ? "text-white" : "text-foreground")}>{user.displayName?.split(' ')[0]}</span>
                       <span className={cn("text-[8px] font-bold opacity-40 uppercase", isHeroState ? "text-white" : "text-foreground")}>Authorized</span>
                    </div>
                    <ChevronDown className={cn("w-3.5 h-3.5 opacity-40", isHeroState ? "text-white" : "text-foreground")} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-[2.5rem] p-4 shadow-4xl border-none mt-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase opacity-40 px-3 py-2 tracking-[0.2em]">Account Protocol</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => router.push('/settings')} className="rounded-2xl gap-4 py-4 font-black text-xs cursor-pointer hover:bg-primary/5 uppercase tracking-widest">
                    <User className="w-5 h-5 text-primary" /> Profile Identity
                  </DropdownMenuItem>
                  {isStaff && (
                    <DropdownMenuItem onSelect={() => router.push('/admin/dashboard')} className="rounded-2xl gap-4 py-4 font-black text-xs cursor-pointer hover:bg-primary/5 uppercase tracking-widest">
                      <LayoutDashboard className="w-5 h-5 text-blue-500" /> Staff Command
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="opacity-10 my-2" />
                  <DropdownMenuItem onSelect={handleLogout} className="rounded-2xl gap-4 py-4 font-black text-xs text-rose-600 cursor-pointer hover:bg-rose-50 uppercase tracking-widest">
                    <LogOut className="w-5 h-5" /> Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button type="button" className={cn(
                  "h-11 rounded-full px-8 font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:scale-[1.05] transition-all border-none",
                  isHeroState ? "bg-white text-black" : "bg-orange-gradient text-white"
                )}>
                  Login
                </Button>
              </Link>
            )
          )}

          {/* MOBILE MENU TRIGGER */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button type="button" className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-90 border border-transparent shadow-sm",
                  isHeroState ? "bg-white/10 text-white hover:bg-white/20" : "bg-secondary/60 dark:bg-zinc-900 text-foreground"
                )}>
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] p-0 border-none bg-background flex flex-col z-[60] shadow-4xl rounded-l-[3.5rem]">
                 <SheetHeader className="p-0 border-none">
                   <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                   <SheetDescription className="sr-only">Access your profile and orders.</SheetDescription>
                 </SheetHeader>

                 <div className="p-10 border-b bg-zinc-50 dark:bg-zinc-900/50 flex flex-col gap-8">
                    {user ? (
                      <div className="flex items-center gap-6">
                        <Avatar className="h-18 w-18 rounded-[1.8rem] border-4 border-white dark:border-zinc-800 shadow-2xl">
                          <AvatarImage src={user.photoURL || ''} />
                          <AvatarFallback className="text-2xl font-black bg-primary text-white uppercase">{user.displayName?.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] leading-none mb-2">Verified Biter</p>
                          <h3 className="text-2xl font-black uppercase tracking-tighter truncate leading-none italic">{user.displayName}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="space-y-2">
                          <h3 className="text-3xl font-black font-headline uppercase tracking-tighter italic leading-none">Welcome <span className="text-primary">Biter.</span></h3>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Authentication required for full nodes.</p>
                        </div>
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                          <Button type="button" className="w-full h-16 rounded-[1.8rem] font-black uppercase text-[11px] tracking-[0.2em] bg-primary shadow-xl shadow-primary/20 gap-3 group">
                             Sign In Protocol <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    )}
                 </div>

                 <div className="flex-1 overflow-y-auto py-8 px-6 space-y-1">
                    {[
                      { label: 'Home Node', href: '/', icon: Home },
                      { label: 'Menu Catalog', href: '/menu', icon: Utensils },
                      { label: 'Live History', href: '/orders', icon: History, authRequired: true },
                      { label: 'AI Support Hub', href: '/support', icon: LifeBuoy, authRequired: true },
                      { label: 'Identity Wishlist', href: '/favorites', icon: Heart, authRequired: true },
                      { label: 'Delivery Anchors', href: '/addresses', icon: MapPin, authRequired: true },
                      { label: 'Active Bounties', href: '/coupons', icon: TicketPercent },
                      { label: 'Staff Command', href: '/admin/dashboard', icon: LayoutDashboard, authRequired: true, staffOnly: true },
                      { label: 'System Settings', href: '/settings', icon: Settings, authRequired: true },
                    ].map((item) => {
                      if (item.authRequired && !user) return null;
                      if (item.staffOnly && !isStaff) return null;
                      
                      const isActive = pathname === item.href;

                      return (
                        <Link key={item.label} href={item.href} onClick={() => setIsMenuOpen(false)} className={cn(
                          "flex items-center gap-6 p-4.5 rounded-[1.5rem] transition-all group",
                          isActive ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                        )}>
                          <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                            isActive ? "bg-primary text-white" : "bg-secondary/80 group-hover:bg-primary/10"
                          )}>
                            <item.icon className={cn("w-5.5 h-5.5", isActive ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                          </div>
                          <span className={cn("font-black text-[11px] uppercase tracking-[0.2em]", isActive ? "text-primary" : "text-foreground/80 group-hover:text-primary")}>{item.label}</span>
                        </Link>
                      );
                    })}
                 </div>

                 <div className="p-8 border-t border-dashed space-y-6">
                    <div className="flex items-center justify-between">
                       <p className="text-[9px] font-black uppercase opacity-30 tracking-widest">Interface Mode</p>
                       <ThemeToggle className="h-10 w-10 bg-secondary rounded-xl" />
                    </div>
                    {user && (
                      <button type="button" onClick={handleLogout} className="flex items-center justify-center gap-4 w-full h-16 rounded-[1.8rem] bg-rose-50 text-rose-600 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-rose-100 transition-colors">
                        <LogOut className="w-5 h-5" /> Terminate Session
                      </button>
                    )}
                 </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};
