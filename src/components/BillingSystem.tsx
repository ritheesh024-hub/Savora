
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { 
  Calculator, Receipt, History, BarChart3, 
  Search, Plus, Minus, Trash2, Printer, 
  Download, Store, User, CreditCard, 
  IndianRupee, Package, CheckCircle2, X
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
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', type: 'Dine-in' });
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
    setActiveBill(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(1, p.quantity + delta);
        return { ...p, quantity: newQty };
      }
      return p;
    }));
  };

  const subtotal = activeBill.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const gst = subtotal * 0.05; // 5% GST
  const total = subtotal + gst - discount;

  const generateBill = async () => {
    if (activeBill.length === 0) return toast({ variant: "destructive", title: "Bill is empty" });
    if (!customerInfo.phone) return toast({ variant: "destructive", title: "Customer phone required" });

    const billId = `INV-${Date.now().toString().slice(-6)}`;
    const billData = {
      orderId: billId,
      customerName: customerInfo.name || 'Guest',
      customerPhone: customerInfo.phone,
      orderType: customerInfo.type,
      items: activeBill,
      subtotal,
      gst,
      discount,
      total,
      paymentMethod,
      status: 'Delivered',
      paymentStatus: 'Paid',
      createdAt: serverTimestamp(),
      isStoreBill: true
    };

    if (db) {
      const billRef = doc(db, 'orders', billId);
      try {
        await setDoc(billRef, billData);
        toast({ title: "Invoice Generated Successfully!" });
        setViewingInvoice(billData);
        setActiveBill([]);
        setCustomerInfo({ name: '', phone: '', type: 'Dine-in' });
      } catch (e) {
        toast({ variant: "destructive", title: "Failed to save bill" });
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Tabs defaultValue="pos" className="w-full">
        <TabsList className="bg-white p-1 rounded-2xl border mb-8 flex w-fit shadow-sm">
          <TabsTrigger value="pos" className="px-8 py-3 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            <Calculator className="w-4 h-4" /> Store POS
          </TabsTrigger>
          <TabsTrigger value="history" className="px-8 py-3 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            <History className="w-4 h-4" /> Invoice History
          </TabsTrigger>
          <TabsTrigger value="summary" className="px-8 py-3 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4" /> Sales Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Menu Selection */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="p-8 border-b flex flex-row items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search items..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 pl-12 rounded-xl border-muted bg-secondary/20 font-bold"
                    />
                  </div>
                  <div className="flex gap-2 ml-4 overflow-x-auto pb-1">
                    {['Dine-in', 'Takeaway'].map(t => (
                      <Button 
                        key={t}
                        variant={customerInfo.type === t ? 'default' : 'outline'}
                        onClick={() => setCustomerInfo({...customerInfo, type: t})}
                        className="rounded-full h-10 px-6 text-[10px] font-black uppercase"
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => addToBill(p)}
                        className="group relative bg-secondary/30 rounded-[2rem] p-4 text-left transition-all hover:bg-primary/5 hover:scale-[1.02] border-2 border-transparent hover:border-primary/20"
                      >
                        <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative shadow-sm">
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform" unoptimized />
                        </div>
                        <h4 className="font-black text-sm line-clamp-1">{p.name}</h4>
                        <p className="text-primary font-black text-base mt-1">₹{p.price}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bill Preview */}
            <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white sticky top-24">
                <CardHeader className="p-8 border-b flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-black font-headline">Active Bill</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setActiveBill([])} className="text-destructive"><Trash2 className="w-5 h-5" /></Button>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase opacity-40">Customer Name</Label>
                        <Input value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} placeholder="Guest" className="h-10 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase opacity-40">Mobile (10-Digit)</Label>
                        <Input value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} placeholder="Required" className="h-10 rounded-xl font-black" />
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                    {activeBill.map(item => (
                      <div key={item.id} className="flex items-center justify-between gap-4 group">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm truncate">{item.name}</h5>
                          <p className="text-[10px] font-black text-primary">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                        <p className="w-16 text-right font-black text-sm">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                    {activeBill.length === 0 && (
                      <div className="text-center py-10 opacity-30">
                        <Calculator className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase">Select items to begin</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-dashed">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                      <span>GST (5%)</span>
                      <span>₹{gst}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                      <span>Discount (₹)</span>
                      <Input 
                        type="number" 
                        value={discount} 
                        onChange={e => setDiscount(Number(e.target.value))} 
                        className="h-8 w-20 text-right bg-transparent border-none focus:ring-0 font-black text-foreground"
                      />
                    </div>
                    <div className="pt-3 border-t flex justify-between items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest">Payable Amount</span>
                      <span className="text-3xl font-black font-headline text-primary italic">₹{total}</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="text-[9px] font-black uppercase opacity-40">Payment Method</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Cash', 'UPI', 'Card'].map(m => (
                        <button 
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={cn(
                            "h-10 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                            paymentMethod === m ? "border-primary bg-primary text-white" : "border-muted"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <Button 
                      onClick={generateBill} 
                      className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 bg-primary text-white"
                    >
                      Generate Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
              <h3 className="text-2xl font-black font-headline">Invoice Archive</h3>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by ID or Mobile..." className="h-12 pl-12 rounded-xl" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b bg-muted/5">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.filter(o => o.isStoreBill).map(inv => (
                    <tr key={inv.orderId} className="group hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-6 font-black text-primary">#{inv.orderId}</td>
                      <td className="px-6 py-6">
                        <p className="font-bold text-sm">{inv.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{inv.customerPhone}</p>
                      </td>
                      <td className="px-6 py-6 font-black">₹{inv.total}</td>
                      <td className="px-6 py-6">
                        <Badge variant="outline" className="rounded-lg text-[9px] uppercase font-black">{inv.paymentMethod}</Badge>
                      </td>
                      <td className="px-6 py-6 text-[10px] font-bold opacity-60">
                        {inv.createdAt?.toDate ? inv.createdAt.toDate().toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-6">
                        <Button variant="ghost" size="sm" onClick={() => setViewingInvoice(inv)} className="rounded-xl font-black text-[9px] uppercase gap-2">
                          <Printer className="w-3 h-3" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {orders.filter(o => o.isStoreBill).length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-20 text-muted-foreground font-bold">No store bills generated yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="rounded-[2rem] p-8 border-none shadow-xl bg-white">
              <p className="text-[10px] font-black uppercase opacity-40 mb-2">Today's Counter Sales</p>
              <h3 className="text-4xl font-black text-primary">₹{orders.filter(o => o.isStoreBill).reduce((a, c) => a + c.total, 0)}</h3>
              <div className="mt-6 flex items-center gap-2 text-green-600 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" /> All payments settled
              </div>
            </Card>
            <Card className="rounded-[2rem] p-8 border-none shadow-xl bg-white">
              <p className="text-[10px] font-black uppercase opacity-40 mb-2">Invoices Issued</p>
              <h3 className="text-4xl font-black">{orders.filter(o => o.isStoreBill).length}</h3>
              <div className="mt-6 text-muted-foreground font-bold text-xs">
                Average per bill: ₹{orders.filter(o => o.isStoreBill).length > 0 ? (orders.filter(o => o.isStoreBill).reduce((a, c) => a + c.total, 0) / orders.filter(o => o.isStoreBill).length).toFixed(0) : 0}
              </div>
            </Card>
            <Card className="rounded-[2rem] p-8 border-none shadow-xl bg-white">
              <p className="text-[10px] font-black uppercase opacity-40 mb-2">Most Used Method</p>
              <h3 className="text-4xl font-black">Cash</h3>
              <div className="mt-6 text-muted-foreground font-bold text-xs uppercase tracking-widest">
                85% of total store revenue
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Print Modal */}
      {viewingInvoice && (
        <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
          <DialogContent className="max-w-md p-0 rounded-[2.5rem] overflow-hidden border-none shadow-3xl bg-white mx-4">
            <div id="printable-invoice" className="p-10 space-y-8 bg-white text-black font-body">
              <div className="text-center space-y-2 pb-6 border-b-2 border-dashed">
                <div className="w-12 h-12 bg-primary rounded-xl mx-auto flex items-center justify-center text-white mb-2">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black font-headline">EZZY BITES CAFE</h2>
                <p className="text-[10px] font-bold opacity-60">Near Anurag University, Hyderabad</p>
                <p className="text-[10px] font-black">GSTIN: 36AAAAA0000A1Z5</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
                <div>
                  <p className="opacity-50 uppercase tracking-widest mb-1">Bill To</p>
                  <p>{viewingInvoice.customerName}</p>
                  <p>+91 {viewingInvoice.customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="opacity-50 uppercase tracking-widest mb-1">Invoice Info</p>
                  <p>ID: #{viewingInvoice.orderId}</p>
                  <p>Type: {viewingInvoice.orderType}</p>
                  <p>{viewingInvoice.createdAt?.toDate ? viewingInvoice.createdAt.toDate().toLocaleDateString() : 'Today'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-4 text-[10px] font-black uppercase border-b pb-2">
                  <span className="col-span-2">Item</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Total</span>
                </div>
                {viewingInvoice.items.map((item: any, i: number) => (
                  <div key={i} className="grid grid-cols-4 text-[11px] font-medium">
                    <span className="col-span-2">{item.name}</span>
                    <span className="text-center">x{item.quantity}</span>
                    <span className="text-right">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-6 border-t-2 border-dashed text-[11px]">
                <div className="flex justify-between font-bold">
                  <span className="opacity-60">Subtotal</span>
                  <span>₹{viewingInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="opacity-60">GST (5%)</span>
                  <span>₹{viewingInvoice.gst}</span>
                </div>
                {viewingInvoice.discount > 0 && (
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Discount</span>
                    <span>-₹{viewingInvoice.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black border-t-2 border-black pt-3">
                  <span>NET TOTAL</span>
                  <span className="text-primary">₹{viewingInvoice.total}</span>
                </div>
              </div>

              <div className="text-center pt-6 space-y-4">
                <div className="inline-block p-2 bg-secondary/30 rounded-xl mb-2">
                   <p className="text-[8px] font-black uppercase mb-1">Payment: {viewingInvoice.paymentMethod}</p>
                   <Image 
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`upi://pay?pa=8639366800@ybl&pn=Ezzy%20Bites&am=${viewingInvoice.total}&cu=INR`)}`} 
                     alt="Payment QR" 
                     width={80} 
                     height={80} 
                     className="mx-auto" 
                     unoptimized
                   />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest italic opacity-40">Thank you for visiting Ezzy Bites!</p>
              </div>
            </div>
            <div className="p-8 bg-secondary/10 flex gap-4 no-print">
              <Button variant="outline" className="flex-1 h-12 rounded-xl font-black text-[9px] uppercase gap-2" onClick={() => window.print()}>
                <Printer className="w-4 h-4" /> Print Bill
              </Button>
              <Button className="flex-1 h-12 rounded-xl font-black text-[9px] uppercase gap-2 bg-primary" onClick={() => setViewingInvoice(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
