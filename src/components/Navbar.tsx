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
  LogIn
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

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  
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
    window.addEventListener('scroll', handleScroll);
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

  const menuItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Menu Selection', href: '/menu', icon: Utensils },
    { label: 'Live History', href: '/orders', icon: History, authRequired: true },
    { label: 'Help & Support', href: '/support', icon: LifeBuoy, authRequired: true },
    { label: 'Favorites', href: '/favorites', icon: Heart, authRequired: true },
    { label: 'Saved Addresses', href: '/addresses', icon: MapPin, authRequired: true },
    { label: 'Coupons & Offers', href: '/coupons', icon: TicketPercent },
    { label: 'Staff Console', href: '/admin/dashboard', icon: LayoutDashboard, authRequired: true, staffOnly: true },
    { label: 'Settings', href: '/settings', icon: Settings, authRequired: true },
  ];

  const isHeroState = pathname === '/' && !scrolled;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/menu?q=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled 
        ? "bg-white/95 dark:bg-black/95 backdrop-blur-3xl border-b py-2 shadow-xl" 
        : "bg-white/5 dark:bg-black/5 backdrop-blur-sm py-3"
    )}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="h-10 md:h-12 flex items-center justify-between gap-4">
          <Link href="/" className="transition-transform active:scale-95">
            <Logo variant={isHeroState ? 'light' : (isDarkMode ? 'light' : 'dark')} size="sm" className="shrink-0" />
          </Link>

          <div className="flex-1 max-w-sm hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10", isHeroState ? "text-white/60" : "text-muted-foreground")} />
              <Input 
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search bites..." 
                className={cn("w-full h-9 pl-10 rounded-xl border-none transition-all font-black text-[10px] uppercase", 
                  isHeroState ? "bg-white/10 !text-white placeholder:text-white/40" : "bg-secondary/60 dark:bg-zinc-900 !text-foreground")}
              />
            </form>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            {mounted && user && (
              <NotificationCenter>
                <Button type="button" variant="ghost" size="icon" className={cn("rounded-full w-10 h-10 transition-all relative", isHeroState ? "text-white" : "text-foreground")}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-primary text-white text-[7px] font-black rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">{unreadCount}</span>}
                </Button>
              </NotificationCenter>
            )}

            <CartDrawer>
              <Button type="button" variant="ghost" size="icon" className={cn("rounded-full w-10 h-10 transition-all relative", isHeroState ? "text-white" : "text-foreground")}>
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">{cart.reduce((acc, i) => acc + i.quantity, 0)}</span>}
              </Button>
            </CartDrawer>

            {/* DESKTOP LOGIN/PROFILE */}
            {mounted && (
              user ? (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className={cn("hidden md:flex items-center gap-2 p-1 pl-2 pr-3 rounded-full transition-all border", isHeroState ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-secondary/60 border-transparent hover:bg-secondary")}>
                      <Avatar className="h-7 w-7 border-2 border-primary shadow-sm">
                        <AvatarImage src={user.photoURL || ''} />
                        <AvatarFallback className="text-[10px] font-black bg-primary text-white">{user.displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className={cn("text-[10px] font-black uppercase tracking-tighter truncate max-w-[80px]", isHeroState ? "text-white" : "text-foreground")}>{user.displayName?.split(' ')[0]}</span>
                      <ChevronDown className={cn("w-3 h-3 opacity-40", isHeroState ? "text-white" : "text-foreground")} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-4xl border-none mt-2">
                    <DropdownMenuLabel className="text-[9px] font-black uppercase opacity-40 px-3 py-2">Account Node</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => router.push('/settings')} className="rounded-xl gap-3 py-3 font-bold cursor-pointer">
                      <User className="w-4 h-4" /> Profile Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="opacity-10" />
                    <DropdownMenuItem onSelect={handleLogout} className="rounded-xl gap-3 py-3 font-bold text-rose-600 cursor-pointer hover:bg-rose-50">
                      <LogOut className="w-4 h-4" /> Terminate Session
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login" className="hidden md:block">
                  <Button type="button" variant="ghost" className={cn("h-9 rounded-full px-5 font-black uppercase text-[10px] tracking-widest gap-2 border border-transparent transition-all", isHeroState ? "text-white hover:bg-white/10 hover:border-white/20" : "text-foreground hover:bg-secondary")}>
                    login
                  </Button>
                </Link>
              )
            )}

            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className={cn("rounded-full w-10 h-10 transition-transform active:scale-90", isHeroState ? "text-white" : "text-foreground")}>
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] p-0 border-none bg-background flex flex-col z-[60] shadow-3xl">
                   <SheetHeader className="p-0 border-none">
                     <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                     <SheetDescription className="sr-only">Access your profile, orders, and application settings.</SheetDescription>
                   </SheetHeader>

                   {/* MOBILE PROFILE SECTION */}
                   <div className="p-6 border-b bg-zinc-50 dark:bg-zinc-900/50">
                      {user ? (
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 rounded-2xl border-4 border-white dark:border-zinc-800 shadow-xl">
                            <AvatarImage src={user.photoURL || ''} />
                            <AvatarFallback className="text-xl font-black bg-primary text-white">{user.displayName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <p className="text-[9px] font-black uppercase text-primary tracking-widest leading-none mb-1">Authenticated Node</p>
                            <h3 className="text-lg font-black uppercase tracking-tighter truncate">{user.displayName}</h3>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h3 className="text-xl font-black font-headline uppercase tracking-tighter italic leading-none">Welcome <span className="text-primary">Biter!</span></h3>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Sign in for the premium experience.</p>
                          </div>
                          <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                            <Button type="button" className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary shadow-lg shadow-primary/20 gap-2">
                               login to account
                            </Button>
                          </Link>
                        </div>
                      )}
                   </div>

                   <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                      {menuItems.map((item) => {
                        if (item.authRequired && !user) return null;
                        if (item.staffOnly && !isStaff) return null;
                        return (
                          <Link key={item.label} href={item.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 group">
                            <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            <span className="font-black text-[10px] uppercase tracking-widest text-foreground/80 group-hover:text-primary">{item.label}</span>
                          </Link>
                        );
                      })}
                      {user && (
                        <button type="button" onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-xl hover:bg-rose-500/5 group w-full text-left mt-4 border-t border-dashed">
                          <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-rose-500" />
                          <span className="font-black text-[10px] uppercase tracking-widest text-foreground/80 group-hover:text-rose-500">Sign Out Hub</span>
                        </button>
                      )}
                   </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};
