'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Calculator, History, 
  Search, Plus, Minus, Printer, 
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BillingSystemProps {
  products: any[];
  orders: any[];
}

export const BillingSystem = ({ products }: BillingSystemProps) => {
  const db = useFirestore();
  const { user } = useUser();
  
  const [activeBill, setActiveBill] = useState<any[]>([]);
  const [orderType, setOrderType] = useState('Dine-In');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', notes: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [discount] = useState(0);
  const [paymentMethod] = useState('Cash');
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  const updateQuantity = (product: any, delta: number) => {
    setActiveBill(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + delta);
        if (newQty === 0) return prev.filter(p => p.id !== product.id);
        return prev.map(p => p.id === product.id ? { ...p, quantity: newQty } : p);
      }
      if (delta > 0) return [...prev, { ...product, quantity: 1 }];
      return prev;
    });
  };

  const subtotal = activeBill.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const total = subtotal - discount;

  const generateBill = async () => {
    if (activeBill.length === 0 || !customerInfo.phone || !db || !user) {
      if (!customerInfo.phone) toast({ variant: "destructive", title: "Missing Identity", description: "Customer phone is required for the ledger." });
      return;
    }
    setLoading(true);
    const billId = `EB-${Math.floor(100000 + Math.random() * 899999)}`;
    const billData = {
      orderId: billId,
      customerName: customerInfo.name || 'Guest',
      customerPhone: customerInfo.phone,
      orderType: orderType,
      instructions: customerInfo.notes,
      items: activeBill.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      subtotal,
      discount,
      total,
      paymentMethod,
      status: 'delivered',
      isStoreBill: true,
      processedBy: user.uid,
      cashierName: user.displayName || user.email?.split('@')[0] || 'Staff',
      createdAt: serverTimestamp()
    };

    setDoc(doc(db, 'orders', billId), billData)
      .then(() => {
        toast({ title: "Bill Generated Successfully" });
        setViewingInvoice({ ...billData, createdAt: new Date() });
        setActiveBill([]);
        setCustomerInfo({ name: '', phone: '', notes: '' });
      })
      .catch((e) => toast({ variant: "destructive", title: "Registry Failure", description: e.message }))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Tabs defaultValue="pos" className="w-full">
        <TabsList className="bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border mb-8 flex w-fit shadow-sm overflow-hidden border-none">
          <TabsTrigger value="pos" className="px-10 py-3.5 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-none border-none"><Calculator className="w-4 h-4" /> POS Counter</TabsTrigger>
          <TabsTrigger value="history" className="px-10 py-3.5 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white shadow-none border-none"><History className="w-4 h-4" /> Ledger Hub</TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="outline-none m-0">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
                <CardHeader className="p-8 border-b bg-muted/5 flex flex-col sm:flex-row gap-6 items-center">
                  <div className="relative w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-40" />
                    <Input placeholder="Search catalog..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-14 pl-14 rounded-2xl border-none bg-secondary/30 dark:bg-zinc-800 font-bold text-base" />
                  </div>
                  <div className="flex gap-2 shrink-0">
                     {['Dine-In', 'Take Away'].map(t => (
                        <button key={t} onClick={() => setOrderType(t)} className={cn("px-6 h-14 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-all", orderType === t ? "bg-primary text-white shadow-lg" : "bg-secondary/40 text-muted-foreground")}>{t}</button>
                     ))}
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
                    {filteredProducts.map(p => {
                      const cartItem = activeBill.find(i => i.id === p.id);
                      return (
                        <div key={p.id} className="bg-secondary/20 dark:bg-zinc-800/50 rounded-[1.8rem] p-4 flex flex-col group border border-transparent hover:border-primary/10 transition-all cursor-pointer active:scale-95" onClick={() => updateQuantity(p, 1)}>
                          <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-white">
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover group-hover:scale-110 transition-all duration-700" unoptimized />
                          </div>
                          <h4 className="font-black text-[11px] uppercase truncate mb-1">{p.name}</h4>
                          <p className="text-primary font-black text-sm italic mb-4">₹{p.price}</p>
                          <div className={cn("w-full h-10 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2", cartItem ? "bg-primary text-white" : "bg-white dark:bg-zinc-700 text-primary border-2")}>
                             {cartItem ? <><CheckCircle2 className="w-3 h-3" /> x{cartItem.quantity}</> : 'Add +'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900 sticky top-[100px] p-8 space-y-8">
                  <h3 className="text-xl font-black uppercase italic border-b pb-4">Settlement</h3>
                  <div className="space-y-3">
                     <div className="space-y-1.5">
                        <Label className="text-[8px] font-black uppercase opacity-40 ml-1">Customer Mobile</Label>
                        <Input value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className="h-12 rounded-xl bg-secondary/30 border-none font-black" placeholder="00000 00000" />
                     </div>
                     <div className="space-y-1.5">
                        <Label className="text-[8px] font-black uppercase opacity-40 ml-1">Identity Label</Label>
                        <Input value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="h-12 rounded-xl bg-secondary/30 border-none font-bold" placeholder="Guest name" />
                     </div>
                  </div>

                  <div className="space-y-4 max-h-[25vh] overflow-y-auto pr-2 scrollbar-hide">
                     {activeBill.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl group">
                           <div className="flex-1 min-w-0 pr-3">
                             <p className="font-black text-[10px] uppercase truncate">{item.name}</p>
                             <p className="text-[8px] font-bold opacity-40">₹{item.price} each</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <button type="button" onClick={() => updateQuantity(item, -1)} className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-rose-50 text-rose-500 transition-all"><Minus className="w-3.5 h-3.5" /></button>
                              <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                              <button type="button" onClick={() => updateQuantity(item, 1)} className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-emerald-50 text-emerald-500 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="pt-6 border-t-2 border-dashed space-y-4">
                    <div className="flex justify-between items-end px-1">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Payable Gross</span>
                      <span className="font-black text-4xl text-primary italic leading-none">₹{total}</span>
                    </div>
                    <Button type="button" onClick={generateBill} disabled={loading || activeBill.length === 0} className="w-full h-16 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] bg-primary text-white shadow-2xl shadow-primary/30 active:scale-[0.98] transition-transform">
                       {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Settle & Print Protocol'}
                    </Button>
                  </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="m-0 outline-none">
           <Card className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-20 text-center space-y-4">
              <History className="w-16 h-16 mx-auto opacity-10" />
              <p className="font-black uppercase tracking-[0.4em] text-[10px] opacity-40">Operational ledger node active</p>
           </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewingInvoice} onOpenChange={(open) => !open && setViewingInvoice(null)}>
        <DialogContent className="max-w-md p-0 rounded-[3rem] overflow-hidden border-none shadow-3xl bg-white text-black">
          <DialogHeader className="p-6 bg-emerald-600 text-white flex flex-row items-center justify-between">
             <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6" />
                <DialogTitle className="font-black uppercase text-xs tracking-widest leading-none">Bill Generated</DialogTitle>
             </div>
             <button type="button" onClick={() => setViewingInvoice(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><X className="w-4 h-4" /></button>
          </DialogHeader>
          <DialogDescription className="sr-only">Detailed manifestation of the generated store bill.</DialogDescription>
          <div className="p-10 text-center space-y-8">
             <div>
                <h2 className="text-4xl font-black font-headline tracking-tighter italic">#{viewingInvoice?.orderId}</h2>
                <p className="text-muted-foreground font-medium text-xs mt-2 uppercase tracking-widest">Protocol generated for <span className="font-black text-black">{viewingInvoice?.customerName}</span></p>
             </div>
             <div className="flex flex-col gap-3">
                <Button type="button" className="w-full h-14 rounded-xl font-black uppercase text-[9px] tracking-widest bg-zinc-950 text-white shadow-xl" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" /> Print Manifest</Button>
                <Button type="button" variant="outline" className="w-full h-14 rounded-xl font-black uppercase text-[9px] tracking-widest border-2" onClick={() => setViewingInvoice(null)}>Dismiss Node</Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
