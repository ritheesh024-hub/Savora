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
  LifeBuoy
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
} from "@/components/ui/sheet";
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

            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className={cn("rounded-full w-10 h-10 transition-transform active:scale-90", isHeroState ? "text-white" : "text-foreground")}>
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] p-0 border-none bg-background flex flex-col z-[60] shadow-3xl">
                   <SheetHeader className="p-6 border-b bg-zinc-50 dark:bg-zinc-900/50">
                     <SheetTitle className="text-xl font-black font-headline uppercase tracking-tighter italic">Ezzy<span className="text-primary">Bites</span> Menu</SheetTitle>
                   </SheetHeader>
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
                        <button onClick={handleLogout} className="flex items-center gap-4 p-4 rounded-xl hover:bg-rose-500/5 group w-full text-left">
                          <History className="w-5 h-5 text-muted-foreground group-hover:text-rose-500" />
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
