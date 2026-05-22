'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { 
  Calculator, Receipt, History, 
  Search, Plus, Minus, Trash2, Printer, 
  ShoppingBag, Utensils, 
  Package, Smartphone, User,
  Clock, X
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BillingSystemProps {
  products: any[];
  orders: any[];
}

export const BillingSystem = ({ products, orders }: BillingSystemProps) => {
  const db = useFirestore();
  const [activeBill, setActiveBill] = useState<any[]>([]);
  const [orderType, setOrderType] = useState('Dine-In');
  const [customerInfo, setCustomerInfo] = useState({ 
    name: '', 
    phone: '', 
    notes: '' 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, searchQuery]);

  const addToBill = (product: any) => {
    setActiveBill(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromBill = (id: string) => {
    setActiveBill(prev => prev.filter(p => p.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setActiveBill(prev => {
      const items = prev.map(p => {
        if (p.id === id) {
          const newQty = Math.max(0, p.quantity + delta);
          return { ...p, quantity: newQty };
        }
        return p;
      }).filter(p => p.quantity > 0);
      return items;
    });
  };

  const subtotal = activeBill.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const total = subtotal - discount;

  const generateBill = async () => {
    if (activeBill.length === 0) {
      toast({ variant: "destructive", title: "Empty Bill", description: "Please add items to the cart." });
      return;
    }
    if (!customerInfo.phone) {
      toast({ variant: "destructive", title: "Mobile Required", description: "Customer mobile number is essential." });
      return;
    }

    const billId = `EB-${Date.now().toString().slice(-6)}`;
    const billData = {
      orderId: billId,
      customerName: customerInfo.name || 'Guest Customer',
      customerPhone: customerInfo.phone,
      orderType: orderType,
      instructions: customerInfo.notes,
      items: activeBill.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
      subtotal,
      discount,
      total,
      paymentMethod,
      status: 'Delivered',
      createdAt: new Date(),
      isStoreBill: true
    };

    if (db) {
      const billRef = doc(db, 'orders', billId);
      try {
        await setDoc(billRef, {
          ...billData,
          createdAt: serverTimestamp()
        });
        toast({ title: "Bill Generated Successfully! 🧾" });
        setViewingInvoice(billData);
        setActiveBill([]);
        setCustomerInfo({ name: '', phone: '', notes: '' });
        setDiscount(0);
      } catch (e) {
        toast({ variant: "destructive", title: "Generation Failed" });
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <Tabs defaultValue="pos" className="w-full">
        <TabsList className="bg-white p-1 rounded-2xl border mb-6 flex w-fit shadow-sm">
          <TabsTrigger value="pos" className="px-8 py-3 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            <Calculator className="w-4 h-4" /> POS Counter
          </TabsTrigger>
          <TabsTrigger value="history" className="px-8 py-3 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            <History className="w-4 h-4" /> Bill Archive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          {/* Order Type Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { id: 'Dine-In', icon: Utensils, label: 'Dine-In' },
              { id: 'Take Away', icon: Package, label: 'Take Away' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setOrderType(type.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3",
                  orderType === type.id 
                    ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10" 
                    : "border-muted bg-white text-muted-foreground hover:border-primary/20"
                )}
              >
                <type.icon className={cn("w-6 h-6", orderType === type.id ? "text-primary" : "text-muted-foreground")} />
                <span className="text-xs font-black uppercase tracking-widest">{type.label}</span>
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Menu Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="p-6 border-b">
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Find a dish..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 pl-12 rounded-xl border-muted bg-secondary/30 font-bold"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map(p => {
                      const cartItem = activeBill.find(i => i.id === p.id);
                      return (
                        <div key={p.id} className="bg-secondary/20 rounded-[1.5rem] p-3 transition-all hover:shadow-md border-2 border-transparent hover:border-primary/10 flex flex-col h-full">
                          <div className="aspect-square rounded-xl overflow-hidden mb-3 relative bg-white">
                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
                          </div>
                          <h4 className="font-bold text-[11px] truncate leading-tight mb-1">{p.name}</h4>
                          <p className="text-primary font-black text-xs">₹{p.price}</p>
                          
                          <div className="mt-auto pt-3">
                            {cartItem ? (
                              <div className="flex items-center justify-between w-full bg-primary text-white rounded-xl h-10 px-2">
                                <button onClick={() => updateQuantity(p.id, -1)} className="p-1 hover:bg-white/20 rounded-lg"><Minus className="w-3.5 h-3.5" /></button>
                                <span className="font-black text-xs">{cartItem.quantity}</span>
                                <button onClick={() => updateQuantity(p.id, 1)} className="p-1 hover:bg-white/20 rounded-lg"><Plus className="w-3.5 h-3.5" /></button>
                              </div>
                            ) : (
                              <Button 
                                onClick={() => addToBill(p)} 
                                variant="outline" 
                                className="w-full h-10 rounded-xl border-primary/30 text-primary font-black uppercase text-[9px] hover:bg-primary hover:text-white transition-all"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bill Cart Section */}
            <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white sticky top-24">
                <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black font-headline">Current Tray</CardTitle>
                    <Badge variant="outline" className="text-[9px] font-black uppercase bg-primary/5 text-primary border-none py-1">
                      {orderType}
                    </Badge>
                  </div>
                  {activeBill.length > 0 && (
                    <button onClick={() => setActiveBill([])} className="text-destructive p-2.5 hover:bg-destructive/5 rounded-full transition-colors">
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Mobile</Label>
                        <Input 
                          value={customerInfo.phone} 
                          onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                          placeholder="00000 00000" 
                          className="h-11 rounded-xl bg-secondary/30 border-none font-black text-xs" 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Name</Label>
                        <Input 
                          value={customerInfo.name} 
                          onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
                          placeholder="Guest" 
                          className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-xs" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[9px] font-black uppercase opacity-40 ml-1">Order Notes</Label>
                      <Input 
                        value={customerInfo.notes} 
                        onChange={e => setCustomerInfo({...customerInfo, notes: e.target.value})} 
                        placeholder="e.g. Extra spicy" 
                        className="h-11 rounded-xl bg-secondary/30 border-none font-medium text-xs" 
                      />
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                    {activeBill.length === 0 ? (
                      <div className="text-center py-16 opacity-30">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No items selected</p>
                      </div>
                    ) : (
                      activeBill.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-secondary/10 p-3.5 rounded-2xl">
                          <div className="flex-1 min-w-0 mr-3">
                            <h5 className="font-bold text-xs truncate">{item.name}</h5>
                            <p className="text-[9px] font-black text-primary/80">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-secondary rounded-lg transition-colors"><Minus className="w-3 h-3" /></button>
                            <span className="text-[11px] font-black w-5 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-secondary rounded-lg transition-colors"><Plus className="w-3 h-3" /></button>
                          </div>
                          <button onClick={() => removeFromBill(item.id)} className="ml-3 text-destructive/40 hover:text-destructive transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 pt-6 border-t border-dashed">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="text-foreground">₹{subtotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                      <span>Discount (₹)</span>
                      <Input 
                        type="number" 
                        value={discount} 
                        onChange={e => setDiscount(Number(e.target.value))} 
                        className="h-8 w-20 text-right bg-transparent border-none p-0 font-black text-foreground focus-visible:ring-0 text-sm"
                      />
                    </div>
                    <div className="pt-6 border-t flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-40">Grand Total</span>
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest mt-0.5">Zero Tax</span>
                      </div>
                      <span className="text-3xl font-black font-headline text-primary italic">₹{total}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4 pt-6">
                    <div className="grid grid-cols-2 gap-3">
                      {['Cash', 'UPI'].map(m => (
                        <button 
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={cn(
                            "h-12 rounded-xl border-2 text-[10px] font-black uppercase transition-all",
                            paymentMethod === m ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" : "border-muted text-muted-foreground hover:border-primary/20"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <Button 
                      onClick={generateBill} 
                      className="w-full h-16 rounded-2xl text-base font-black shadow-2xl shadow-primary/30 bg-primary text-white hover:scale-[1.02] transition-all"
                    >
                      Generate Bill
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black font-headline">Store Invoice History</h3>
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search records..." className="h-11 pl-11 rounded-xl" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-muted/10 border-b">
                  <tr className="text-[10px] font-black uppercase text-muted-foreground">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.filter(o => o.isStoreBill).map(inv => (
                    <tr key={inv.orderId} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-5 font-black text-primary">#{inv.orderId}</td>
                      <td className="px-6 py-5">
                        <p className="font-bold text-xs">{inv.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{inv.customerPhone}</p>
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant="outline" className="text-[9px] uppercase font-black bg-secondary border-none">{inv.orderType}</Badge>
                      </td>
                      <td className="px-6 py-5 font-black text-sm text-primary">₹{inv.total}</td>
                      <td className="px-6 py-5">
                        <Button variant="ghost" size="sm" onClick={() => setViewingInvoice(inv)} className="font-black text-[10px] uppercase gap-2">
                          <Printer className="w-3.5 h-3.5" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Modal */}
      <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
        <DialogContent className="max-w-md p-0 rounded-[2.5rem] overflow-hidden border-none shadow-3xl bg-white mx-4">
          <div id="print-pos-bill" className="p-10 space-y-8 text-black bg-white">
            <div className="text-center space-y-3 border-b-2 border-dashed pb-8">
              <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg rotate-6">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black font-headline tracking-tight uppercase">EZZY BITES</h2>
              <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Premium Fast Food Cafe</p>
              <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase font-black px-5 py-1.5 mt-3 rounded-full">
                {viewingInvoice?.orderType} Receipt
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6 text-[11px] font-bold opacity-80">
              <div className="space-y-1.5">
                <p className="uppercase text-[9px] opacity-40 tracking-widest">Customer Info</p>
                <p className="text-lg font-black">{viewingInvoice?.customerName}</p>
                <p className="text-primary">+91 {viewingInvoice?.customerPhone}</p>
              </div>
              <div className="text-right space-y-1.5">
                <p className="uppercase text-[9px] opacity-40 tracking-widest">Order Details</p>
                <p className="font-black text-primary text-lg">#{viewingInvoice?.orderId}</p>
                <p className="opacity-60">{viewingInvoice?.createdAt ? new Date(viewingInvoice.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Just Now'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-4 text-[10px] font-black uppercase opacity-40 border-b pb-3 tracking-widest">
                <span className="col-span-2">Dish Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Total</span>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {viewingInvoice?.items.map((item: any, i: number) => (
                  <div key={i} className="grid grid-cols-4 text-xs font-black">
                    <span className="col-span-2 truncate">{item.name}</span>
                    <span className="text-center opacity-60">x{item.quantity}</span>
                    <span className="text-right">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-8 border-t-2 border-dashed">
              <div className="flex justify-between text-[11px] font-bold opacity-60">
                <span>Subtotal</span>
                <span>₹{viewingInvoice?.subtotal}</span>
              </div>
              {viewingInvoice?.discount > 0 && (
                <div className="flex justify-between text-[11px] font-black text-green-600 uppercase">
                  <span>Savings</span>
                  <span>-₹{viewingInvoice.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-3xl font-black border-t-2 border-black pt-6 mt-4">
                <span className="font-headline tracking-tight">TOTAL</span>
                <span className="text-primary italic">₹{viewingInvoice?.total}</span>
              </div>
            </div>

            <div className="text-center pt-8 space-y-6">
               <div className="inline-block p-3 bg-secondary/30 rounded-3xl border-2 border-white shadow-inner">
                  <Image 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=8639366800@ybl&pn=Ezzy%20Bites&am=${viewingInvoice?.total}&cu=INR`)}`} 
                    alt="Payment QR" 
                    width={120} 
                    height={120} 
                    className="mx-auto mix-blend-multiply" 
                    unoptimized
                  />
                  <p className="text-[9px] font-black uppercase mt-3 opacity-50 tracking-widest">Scan to Pay via UPI</p>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Visit Again • Stay Ezzy</p>
                 <p className="text-[8px] opacity-20">Terms & Conditions Apply</p>
               </div>
            </div>
          </div>
          
          <div className="p-8 bg-secondary/20 flex gap-4 border-t no-print">
            <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase gap-2 tracking-widest border-muted-foreground/20" onClick={() => window.print()}>
              <Printer className="w-4.5 h-4.5" /> Print Receipt
            </Button>
            <Button className="flex-1 h-14 rounded-2xl font-black text-[10px] uppercase bg-primary tracking-widest shadow-xl shadow-primary/20" onClick={() => setViewingInvoice(null)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-pos-bill, #print-pos-bill * { visibility: visible; }
          #print-pos-bill {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 40px;
            background: white;
            box-shadow: none !important;
            z-index: 9999;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};
