
"use client"
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  IndianRupee, Sparkles, Loader2, 
  Package, Clock, CheckCircle2,
  Megaphone,
  LayoutDashboard, Trash2, Plus, Edit2, X, Image as ImageIcon, Upload, RefreshCw
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CATEGORIES } from '@/app/lib/menu-data';
import { dailySpecialGenerator } from '@/ai/flows/daily-special-generator';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const AdminSection = () => {
  const db = useFirestore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  // Real-time Queries
  const ordersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50));
  }, [db]);
  const { data: realOrders, loading: ordersLoading } = useCollection<any>(ordersQuery);

  const menuQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'menu'), orderBy('name'));
  }, [db]);
  const { data: dbMenu, loading: menuLoading } = useCollection<any>(menuQuery);

  // Marketing AI State
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<any>(null);
  const [selectedPromoDish, setSelectedPromoDish] = useState<any>(null);

  // Menu Management State
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [menuFormData, setMenuFormData] = useState({
    name: '', 
    description: '', 
    price: '', 
    category: 'Veg Maggie', 
    image: '', 
    isVeg: true, 
    isAvailable: true, 
    rating: '4.5'
  });

  // Calculate Stats
  const stats = useMemo(() => {
    if (!realOrders) return { revenue: 0, count: 0, delivered: 0 };
    const deliveredOrders = realOrders.filter(o => o.status === 'Delivered');
    const revenue = deliveredOrders.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    return { revenue, count: realOrders.length, delivered: deliveredOrders.length };
  }, [realOrders]);

  // Actions
  const handleUpdateStatus = (id: string, newStatus: string) => {
    if (!db) return;
    const orderRef = doc(db, 'orders', id);
    updateDoc(orderRef, { status: newStatus })
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: orderRef.path, 
          operation: 'update',
          requestResourceData: { status: newStatus }
        }));
      });
  };

  const handleDeleteOrder = (id: string) => {
    if (!db || !window.confirm("Delete order record?")) return;
    const orderRef = doc(db, 'orders', id);
    deleteDoc(orderRef)
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: orderRef.path, 
          operation: 'delete' 
        }));
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 750 * 1024) { 
        toast({ variant: "destructive", title: "File too large", description: "Max 750KB allowed." });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMenuFormData(prev => ({ ...prev, image: event.target?.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setMenuFormData({ 
      name: '', 
      description: '', 
      price: '', 
      category: 'Veg Maggie', 
      image: '', 
      isVeg: true, 
      isAvailable: true, 
      rating: '4.5' 
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => firstInputRef.current?.focus(), 150);
  };

  const handleSaveMenuItem = () => {
    if (!db || !menuFormData.name || !menuFormData.image) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Name and Image are required." });
      return;
    }
    
    if (saveLoading) return;
    setSaveLoading(true);
    
    const isEditing = !!editingItem;
    const itemId = isEditing ? editingItem.id : `ITEM-${Date.now()}`;
    const itemRef = doc(db, 'menu', itemId);
    
    const finalData = {
      id: itemId,
      name: menuFormData.name.trim(),
      description: (menuFormData.description || '').trim(),
      price: Number(menuFormData.price) || 0,
      category: menuFormData.category,
      image: menuFormData.image,
      isVeg: Boolean(menuFormData.isVeg),
      isAvailable: Boolean(menuFormData.isAvailable),
      rating: Number(menuFormData.rating) || 4.5,
      updatedAt: serverTimestamp()
    };

    // Use non-blocking mutation pattern
    setDoc(itemRef, finalData, { merge: true })
      .then(() => {
        toast({ 
          title: isEditing ? "Item Updated" : "Dish Published 🚀", 
          description: `${finalData.name} is now live.` 
        });
        if (isEditing) setIsMenuDialogOpen(false);
        resetForm();
        setSaveLoading(false);
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: itemRef.path, 
          operation: 'write', 
          requestResourceData: finalData 
        }));
        toast({
          variant: "destructive",
          title: "Publishing Failed",
          description: "Check permissions or internet connection."
        });
        setSaveLoading(false);
      });
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setMenuFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || 'Veg Maggie',
      image: item.image || '',
      isVeg: item.isVeg !== undefined ? item.isVeg : true,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      rating: item.rating?.toString() || '4.5'
    });
    setIsMenuDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    if (!db || !window.confirm("Remove this dish from menu?")) return;
    const itemRef = doc(db, 'menu', id);
    deleteDoc(itemRef)
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: itemRef.path, 
          operation: 'delete' 
        }));
      });
  };

  const handleGeneratePromo = async () => {
    if (!selectedPromoDish) return;
    setPromoLoading(true);
    try {
      const result = await dailySpecialGenerator({ 
        dishName: selectedPromoDish.name, 
        basePrice: selectedPromoDish.price, 
        discountPercent: 15 
      });
      setPromoResult(result);
    } catch (error) {
      toast({ variant: "destructive", title: "AI Generation Failed" });
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <section className="py-6 md:py-10 bg-secondary/5 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top duration-700">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary rounded-2xl shadow-xl transform -rotate-3">
                 <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight font-headline">Admin <span className="text-primary">Console</span></h1>
            </div>
            <p className="text-sm text-muted-foreground font-medium pl-1">Live Order & Inventory Management</p>
          </div>
          <Badge variant="outline" className="bg-green-100/50 text-green-700 border-green-200 px-4 py-1.5 text-[10px] uppercase font-black rounded-full animate-pulse">
            Connected Live
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-card p-1.5 rounded-2xl border w-full flex overflow-x-auto scrollbar-hide shadow-sm">
            <TabsTrigger value="overview" className="flex-1 text-[11px] font-black py-3 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-widest">Overview</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 text-[11px] font-black py-3 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-widest">Orders</TabsTrigger>
            <TabsTrigger value="inventory" className="flex-1 text-[11px] font-black py-3 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-widest">Inventory</TabsTrigger>
            <TabsTrigger value="marketing" className="flex-1 text-[11px] font-black py-3 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white uppercase tracking-widest gap-2 flex items-center justify-center">
              <Sparkles className="w-4 h-4" /> Marketing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
               {[
                 { label: "Revenue", value: `₹${stats.revenue}`, icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
                 { label: "Orders", value: stats.count, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
                 { label: "Efficiency", value: stats.count > 0 ? `${Math.round((stats.delivered/stats.count)*100)}%` : '0%', icon: CheckCircle2, color: "text-orange-600", bg: "bg-orange-50" },
                 { label: "Rating", value: "4.8", icon: Sparkles, color: "text-yellow-600", bg: "bg-yellow-50" }
               ].map((s, i) => (
                 <Card key={i} className="rounded-3xl border-none shadow-lg bg-card transition-transform hover:scale-105">
                    <CardContent className="p-6 text-center sm:text-left">
                       <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 ${s.color} mx-auto sm:mx-0`}>
                          <s.icon className="w-6 h-6" />
                       </div>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
                       <h3 className="text-2xl font-black">{s.value}</h3>
                    </CardContent>
                 </Card>
               ))}
             </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="rounded-3xl shadow-xl border-none overflow-hidden bg-card">
              <div className="overflow-x-auto">
                {ordersLoading ? (
                  <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                ) : (
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-[10px] font-black uppercase px-6">Customer</TableHead>
                        <TableHead className="text-[10px] font-black uppercase px-6">Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase px-6 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realOrders.map((order: any) => (
                        <TableRow key={order.id} className="border-muted/20">
                          <TableCell className="px-6 font-bold">{order.customerName}<br/><span className="text-[10px] text-muted-foreground">₹{order.total}</span></TableCell>
                          <TableCell className="px-6">
                            <Badge className="text-[9px] uppercase font-black" variant="secondary">{order.status}</Badge>
                          </TableCell>
                          <TableCell className="px-6 text-right">
                             <div className="flex justify-end gap-2">
                                <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl" onClick={() => handleUpdateStatus(order.id, 'Preparing')}><Clock className="w-4 h-4"/></Button>
                                <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl" onClick={() => handleUpdateStatus(order.id, 'Delivered')}><CheckCircle2 className="w-4 h-4"/></Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-8">
            <Button 
              className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[11px] gap-2 shadow-xl" 
              onClick={() => { resetForm(); setIsMenuDialogOpen(true); }}
            >
              <Plus className="w-5 h-5" /> Add New Dish
            </Button>

            <Dialog open={isMenuDialogOpen} onOpenChange={(open) => { 
              if(!open) resetForm(); 
              setIsMenuDialogOpen(open); 
            }}>
              <DialogContent className="max-w-2xl p-0 rounded-[32px] overflow-hidden border-none shadow-3xl bg-card">
                <div className="bg-primary p-6 text-white">
                  <DialogTitle className="text-xl font-black uppercase tracking-tight font-headline">
                    {editingItem ? 'Edit Dish' : 'Add New Dish'}
                  </DialogTitle>
                </div>
                <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dish Name</Label>
                    <Input 
                      ref={firstInputRef} 
                      value={menuFormData.name} 
                      onChange={e => setMenuFormData({...menuFormData, name: e.target.value})} 
                      placeholder="e.g. Peri Peri Maggie"
                      className="rounded-xl h-12 bg-secondary/20" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Price (₹)</Label>
                      <Input 
                        type="number" 
                        value={menuFormData.price} 
                        onChange={e => setMenuFormData({...menuFormData, price: e.target.value})} 
                        className="rounded-xl h-12 bg-secondary/20" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                      <select 
                        className="w-full h-12 rounded-xl border bg-secondary/20 px-3 text-sm font-bold uppercase" 
                        value={menuFormData.category} 
                        onChange={e => setMenuFormData({...menuFormData, category: e.target.value})}
                      >
                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Photo Upload</Label>
                    <div 
                      className="border-2 border-dashed rounded-2xl p-6 text-center bg-secondary/10 cursor-pointer hover:bg-secondary/20 transition-colors" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {menuFormData.image ? (
                        <div className="relative group">
                          <img src={menuFormData.image} className="h-40 w-full object-cover rounded-xl shadow-lg" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
                            <RefreshCw className="text-white w-8 h-8" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-6 gap-2">
                          <Upload className="w-10 h-10 text-muted-foreground opacity-50" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Click to upload image</p>
                          <p className="text-[8px] text-muted-foreground">Max 750KB recommended</p>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                    <Textarea 
                      value={menuFormData.description} 
                      onChange={e => setMenuFormData({...menuFormData, description: e.target.value})} 
                      placeholder="Describe the dish..."
                      className="rounded-xl min-h-[80px] bg-secondary/20" 
                    />
                  </div>
                </div>
                <div className="p-6 bg-secondary/10 flex gap-3 border-t">
                  <Button variant="outline" className="flex-1 rounded-xl h-12 font-black uppercase" onClick={() => setIsMenuDialogOpen(false)} disabled={saveLoading}>
                    Close
                  </Button>
                  <Button className="flex-1 rounded-xl h-12 font-black uppercase shadow-lg shadow-primary/20" onClick={handleSaveMenuItem} disabled={saveLoading}>
                    {saveLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : editingItem ? 'Update Dish' : 'Publish Dish'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuLoading ? (
                <div className="col-span-full py-20 flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="font-bold text-muted-foreground">Loading inventory...</p>
                </div>
              ) : (
                dbMenu?.map((item: any) => (
                  <Card key={item.id} className="rounded-3xl border-none shadow-lg overflow-hidden bg-card transition-all hover:shadow-2xl animate-in zoom-in duration-300">
                    <div className="h-44 bg-muted relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur shadow-sm text-[8px] font-black uppercase">
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </Badge>
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Badge variant="destructive" className="uppercase font-black">Sold Out</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0 flex-1 mr-2">
                          <h4 className="font-black truncate text-base">{item.name}</h4>
                          <p className="text-[10px] text-muted-foreground font-medium truncate">{item.category}</p>
                        </div>
                        <p className="font-black text-primary text-lg">₹{item.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1 rounded-xl h-11 font-black text-[10px] uppercase gap-2" 
                          onClick={() => handleEditClick(item)}
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="rounded-xl h-11 px-4 text-destructive hover:bg-destructive/5" 
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          </TabsContent>

          <TabsContent value="marketing">
             <Card className="rounded-[40px] border-none shadow-xl bg-card p-10">
                <div className="max-w-2xl">
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-4">AI Marketing</h3>
                  <p className="text-muted-foreground mb-8 font-medium">Pick a dish and let our AI create a viral promotion for your social media.</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {dbMenu?.slice(0, 8).map((item: any) => (
                      <button 
                        key={item.id} 
                        onClick={() => setSelectedPromoDish(item)} 
                        className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${selectedPromoDish?.id === item.id ? 'border-primary bg-primary/5 scale-105' : 'border-muted hover:border-primary/30'}`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20" 
                    onClick={handleGeneratePromo} 
                    disabled={promoLoading || !selectedPromoDish}
                  >
                    {promoLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Megaphone className="w-5 h-5" />} 
                    Generate Promo
                  </Button>
                  
                  {promoResult && (
                    <div className="mt-10 p-8 bg-primary/5 rounded-3xl border-2 border-primary/20 space-y-5 animate-in zoom-in">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-2xl">{promoResult.promoTitle} {promoResult.emoji}</h4>
                        <Badge className="bg-primary text-white font-black">₹{promoResult.finalPrice}</Badge>
                      </div>
                      <p className="text-sm italic opacity-80 leading-relaxed font-medium">"{promoResult.promoDescription}"</p>
                      <Button 
                        className="w-full h-12 rounded-xl font-black uppercase gap-2" 
                        onClick={() => {
                          navigator.clipboard.writeText(`${promoResult.promoTitle} ${promoResult.emoji}\n\n${promoResult.promoDescription}\n\nOrder now at just ₹${promoResult.finalPrice}!`);
                          toast({ title: "Content Copied!" });
                        }}
                      >
                        <RefreshCw className="w-4 h-4" /> Copy Post Text
                      </Button>
                    </div>
                  )}
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
