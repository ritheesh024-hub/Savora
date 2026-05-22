"use client"
import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  IndianRupee, Sparkles, Loader2, 
  Package, Clock, CheckCircle2,
  Megaphone, LayoutDashboard, Trash2, Plus, Edit2, Link as LinkIcon,
  MapPin, Phone, Database, Info, Coffee,
  Receipt, Calculator, History, Printer, Search,
  Store, AlertCircle, Ban, Truck, ChefHat
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CATEGORIES, MENU_ITEMS } from '@/app/lib/menu-data';
import { dailySpecialGenerator } from '@/ai/flows/daily-special-generator';
import { toast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, doc, updateDoc, deleteDoc, setDoc, serverTimestamp, writeBatch, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { DashboardAnalysis } from './DashboardAnalysis';
import { BillingSystem } from './BillingSystem';
import { cn } from '@/lib/utils';

export const AdminSection = () => {
  const db = useFirestore();
  const firstInputRef = useRef<HTMLInputElement>(null);
  
  const ordersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(300));
  }, [db]);
  const { data: realOrders, loading: ordersLoading } = useCollection<any>(ordersQuery);

  const menuQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'products'));
  }, [db]);
  const { data: dbMenu, loading: menuLoading } = useCollection<any>(menuQuery);

  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<any>(null);
  const [selectedPromoDish, setSelectedPromoDish] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [menuFormData, setMenuFormData] = useState({
    name: '', description: '', price: '', category: 'Veg Maggie', imageUrl: '', isVeg: true, isAvailable: true, rating: '4.5', isBeverage: false
  });

  const handleUpdateStatus = (id: string, newStatus: string) => {
    if (!db) return;
    const orderRef = doc(db, 'orders', id);
    updateDoc(orderRef, { status: newStatus }).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: orderRef.path, operation: 'update', requestResourceData: { status: newStatus }
      }));
    });
    toast({ title: `Order set to ${newStatus}` });
  };

  const handleDeleteOrder = (id: string) => {
    if (!db || !window.confirm("Remove order from system permanently?")) return;
    const orderRef = doc(db, 'orders', id);
    deleteDoc(orderRef).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: orderRef.path, operation: 'delete' }));
    });
  };

  const resetForm = () => {
    setEditingItem(null);
    setMenuFormData({ name: '', description: '', price: '', category: 'Veg Maggie', imageUrl: '', isVeg: true, isAvailable: true, rating: '4.5', isBeverage: false });
  };

  const handleSeedMenu = async () => {
    if (!db) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      MENU_ITEMS.forEach((item) => {
        const itemRef = doc(db, 'products', item.id);
        batch.set(itemRef, {
          ...item,
          createdAt: serverTimestamp()
        }, { merge: true });
      });
      await batch.commit();
      toast({ title: "Inventory Seeded Successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Seeding Failed" });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSaveMenuItem = () => {
    if (!db || !menuFormData.name || !menuFormData.imageUrl) {
      toast({ variant: "destructive", title: "Incomplete Data" });
      return;
    }
    
    setSaveLoading(true);
    const itemId = editingItem ? editingItem.id : `PROD-${Date.now()}`;
    const itemRef = doc(db, 'products', itemId);
    
    const finalData = {
      id: itemId,
      name: menuFormData.name.trim(),
      description: menuFormData.description.trim(),
      price: Number(menuFormData.price) || 0,
      category: menuFormData.category,
      imageUrl: menuFormData.imageUrl.trim(),
      isVeg: menuFormData.isVeg,
      isAvailable: menuFormData.isAvailable,
      isBeverage: menuFormData.isBeverage,
      rating: Number(menuFormData.rating) || 4.5,
      createdAt: editingItem?.createdAt || serverTimestamp()
    };

    setDoc(itemRef, finalData, { merge: true })
      .then(() => {
        setSaveLoading(false);
        toast({ title: "Inventory Updated" });
        setIsMenuDialogOpen(false);
        resetForm();
      })
      .catch(async (e) => {
        setSaveLoading(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: itemRef.path, operation: 'write', requestResourceData: finalData 
        }));
      });
  };

  const hideVegOption = ['Tea', 'Coffee', 'Ice creams'].includes(menuFormData.category);

  return (
    <section className="py-6 md:py-12 bg-secondary/5 min-h-screen overflow-x-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary rounded-3xl shadow-2xl shadow-primary/20 flex items-center justify-center text-white transform rotate-3">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter">Ezzy<span className="text-primary italic">Console</span></h1>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">System Operations Engine v2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <Badge variant="outline" className="text-green-700 border-none px-0 uppercase font-black text-[9px]">Live Data Uplink</Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-10">
          <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4">
            <TabsList className="bg-white p-1 rounded-3xl border min-w-max md:w-full flex shadow-xl">
              <TabsTrigger value="overview" className="px-8 py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Analysis</TabsTrigger>
              <TabsTrigger value="billing" className="px-8 py-4 font-black uppercase tracking-widest text-[10px] gap-2 flex items-center justify-center rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Receipt className="w-4 h-4" /> Billing
              </TabsTrigger>
              <TabsTrigger value="orders" className="px-8 py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Live Orders ({realOrders?.length || 0})</TabsTrigger>
              <TabsTrigger value="inventory" className="px-8 py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Inventory</TabsTrigger>
              <TabsTrigger value="marketing" className="px-8 py-4 font-black uppercase tracking-widest text-[10px] gap-2 flex items-center justify-center rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Sparkles className="w-4 h-4" /> AI Labs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
             <DashboardAnalysis orders={realOrders || []} products={dbMenu || []} />
          </TabsContent>

          <TabsContent value="billing">
            <BillingSystem products={dbMenu || []} orders={realOrders || []} />
          </TabsContent>

          <TabsContent value="orders">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Status Columns logic can be expanded here, but for now we list all professional cards */}
              <div className="lg:col-span-4 space-y-6">
                {ordersLoading ? (
                  <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
                ) : !realOrders || realOrders.length === 0 ? (
                  <div className="py-32 text-center bg-white/50 rounded-[4rem] border-4 border-dashed border-muted/20">
                    <Package className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-10" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No orders currently in the pipeline</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {realOrders.map((order: any) => (
                      <Card key={order.id} className={cn(
                        "rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden group transition-all",
                        order.status === 'Cancelled' && "opacity-60 grayscale"
                      )}>
                        <CardContent className="p-0">
                          <div className="flex flex-col h-full">
                            <div className="p-6 md:p-8 border-b bg-muted/5 flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-black px-4 py-1.5 rounded-full">#{order.orderId}</Badge>
                                  <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Recent'}</span>
                                </div>
                                <h4 className="text-2xl font-black tracking-tight">{order.customerName}</h4>
                                <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 mt-1"><Phone className="w-3.5 h-3.5" /> {order.customerPhone}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Total Due</p>
                                <p className="text-3xl font-black text-primary italic">₹{order.total}</p>
                              </div>
                            </div>

                            <div className="p-6 md:p-8 flex-1 space-y-6">
                              {order.address && (
                                <div className="flex items-start gap-4 p-4 bg-secondary/30 rounded-2xl">
                                  <MapPin className="w-4.5 h-4.5 text-primary mt-0.5 shrink-0" />
                                  <p className="text-xs font-bold leading-relaxed opacity-80">{order.address}</p>
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1 ml-1">KOT Breakdown</p>
                                {order.items?.map((item: any, i: number) => (
                                  <div key={i} className="flex justify-between items-center bg-muted/20 p-3 rounded-xl border border-white/50">
                                    <div className="flex items-center gap-3">
                                      <span className="w-6 h-6 bg-primary text-white rounded-lg flex items-center justify-center text-[10px] font-black">x{item.quantity}</span>
                                      <span className="text-xs font-bold truncate max-w-[120px] md:max-w-[200px]">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-primary">₹{item.price * item.quantity}</span>
                                  </div>
                                ))}
                              </div>

                              {order.instructions && (
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-2">
                                  <Info className="w-3.5 h-3.5" /> Special: {order.instructions}
                                </div>
                              )}
                            </div>

                            <div className="p-6 md:p-8 bg-secondary/5 border-t border-white/20 flex flex-col md:flex-row gap-4 items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge className={cn(
                                  "font-black text-[10px] uppercase px-4 py-1.5 rounded-full border-none tracking-widest",
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                )}>
                                  {order.status === 'Pending' ? 'New Order' : order.status === 'Delivered' ? 'Completed' : order.status}
                                </Badge>
                                {order.orderType && <Badge variant="outline" className="text-[10px] font-black uppercase opacity-60 border-none">{order.orderType}</Badge>}
                              </div>
                              
                              <div className="flex gap-2 w-full md:w-auto">
                                {order.status === 'Pending' && (
                                  <Button size="sm" className="flex-1 md:flex-none h-11 rounded-xl font-black text-[10px] uppercase gap-2 bg-primary shadow-lg shadow-primary/20" onClick={() => handleUpdateStatus(order.id, 'Preparing')}>
                                    <ChefHat className="w-4 h-4" /> Start Prep
                                  </Button>
                                )}
                                {order.status === 'Preparing' && (
                                  <Button size="sm" className="flex-1 md:flex-none h-11 rounded-xl font-black text-[10px] uppercase gap-2 bg-orange-500 text-white" onClick={() => handleUpdateStatus(order.id, 'Delivered')}>
                                    <Package className="w-4 h-4" /> Complete
                                  </Button>
                                )}
                                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                  <Button size="icon" variant="outline" className="h-11 w-11 rounded-xl text-destructive hover:bg-red-50 border-destructive/20" onClick={() => handleUpdateStatus(order.id, 'Cancelled')}>
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button size="icon" variant="ghost" className="h-11 w-11 rounded-xl text-muted-foreground opacity-30 hover:opacity-100 hover:bg-muted" onClick={() => handleDeleteOrder(order.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-10">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => { resetForm(); setIsMenuDialogOpen(true); }} className="rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] gap-3 shadow-2xl shadow-primary/30 w-full sm:w-auto bg-primary text-white">
                <Plus className="w-6 h-6" /> Add Product
              </Button>
              <Button onClick={handleSeedMenu} disabled={isSeeding} variant="outline" className="rounded-2xl h-16 px-10 font-black uppercase tracking-widest text-[11px] gap-3 w-full sm:w-auto border-2">
                {isSeeding ? <Loader2 className="w-6 h-6 animate-spin" /> : <Database className="w-6 h-6" />}
                Reset Inventory
              </Button>
            </div>

            <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
              <DialogContent className="max-w-2xl p-0 rounded-[3rem] overflow-hidden border-none shadow-3xl bg-card">
                <div className="bg-primary p-10 text-white relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  <DialogTitle className="text-3xl font-black font-headline uppercase tracking-tight relative z-10">
                    {editingItem ? 'Edit Product' : 'Add Product'}
                  </DialogTitle>
                </div>
                <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Dish Name</Label>
                    <Input 
                      ref={firstInputRef} 
                      value={menuFormData.name} 
                      onChange={e => setMenuFormData({...menuFormData, name: e.target.value})} 
                      placeholder="e.g. Hyderabadi Biryani" 
                      className="h-14 rounded-2xl focus:ring-primary/20 font-bold border-muted" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Base Price (₹)</Label>
                      <Input 
                        type="number" 
                        value={menuFormData.price} 
                        onChange={e => setMenuFormData({...menuFormData, price: e.target.value})} 
                        className="h-14 rounded-2xl focus:ring-primary/20 font-bold border-muted" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Category</Label>
                      <select 
                        value={menuFormData.category} 
                        onChange={e => setMenuFormData({...menuFormData, category: e.target.value})} 
                        className="w-full h-14 rounded-2xl border bg-secondary/20 px-6 text-[11px] font-black uppercase outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {!hideVegOption && (
                      <div className="p-6 rounded-3xl bg-secondary/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", menuFormData.isVeg ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                            <Info className="w-6 h-6" />
                          </div>
                          <div>
                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Dietary</Label>
                            <p className="text-sm font-black">{menuFormData.isVeg ? 'Veg' : 'Non-Veg'}</p>
                          </div>
                        </div>
                        <Switch 
                          checked={menuFormData.isVeg} 
                          onCheckedChange={(checked) => setMenuFormData({...menuFormData, isVeg: checked})} 
                        />
                      </div>
                    )}
                    
                    <div className="p-6 rounded-3xl bg-secondary/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100 text-amber-600">
                          <Coffee className="w-6 h-6" />
                        </div>
                        <div>
                          <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Type</Label>
                          <p className="text-sm font-black">{menuFormData.isBeverage ? 'Beverage' : 'Solid'}</p>
                        </div>
                      </div>
                      <Switch 
                        checked={menuFormData.isBeverage} 
                        onCheckedChange={(checked) => setMenuFormData({...menuFormData, isBeverage: checked})} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Image Asset URL</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                      <Input 
                        value={menuFormData.imageUrl} 
                        onChange={e => setMenuFormData({...menuFormData, imageUrl: e.target.value})} 
                        placeholder="https://..." 
                        className="h-14 rounded-2xl pl-14 font-bold border-muted" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-60">Description</Label>
                    <Textarea 
                      value={menuFormData.description} 
                      onChange={e => setMenuFormData({...menuFormData, description: e.target.value})} 
                      placeholder="Chef's special notes..." 
                      className="rounded-3xl min-h-[140px] p-6 font-bold border-muted" 
                    />
                  </div>
                </div>
                <div className="p-10 bg-secondary/10 flex gap-6">
                  <Button variant="outline" className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] border-muted-foreground/20" onClick={() => setIsMenuDialogOpen(false)}>Abort</Button>
                  <Button className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/30 bg-primary text-white" onClick={handleSaveMenuItem} disabled={saveLoading}>
                    {saveLoading ? <Loader2 className="animate-spin" /> : 'Confirm Product'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {menuLoading ? (
                <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
              ) : dbMenu?.map((item: any) => (
                <Card key={item.id} className="rounded-[3rem] border-none shadow-2xl overflow-hidden group hover:scale-[1.02] transition-all bg-white">
                  <div className="h-56 relative overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <Badge className="absolute top-5 left-5 bg-white/90 backdrop-blur-md text-[8px] uppercase font-black text-foreground border-none px-4 py-1.5 rounded-full shadow-lg">
                      {item.category}
                    </Badge>
                  </div>
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 truncate mr-3">
                        <h4 className="font-black text-xl tracking-tight truncate">{item.name}</h4>
                        <div className="flex gap-2 mt-1.5">
                          {!['Tea', 'Coffee', 'Ice creams'].includes(item.category) && (
                            <p className={cn("text-[8px] font-black uppercase", item.isVeg ? "text-green-600" : "text-red-600")}>
                              {item.isVeg ? 'Veg' : 'Non-Veg'}
                            </p>
                          )}
                          {item.isBeverage && <p className="text-[8px] font-black uppercase text-amber-600">Beverage</p>}
                        </div>
                      </div>
                      <p className="text-2xl font-black text-primary italic">₹{item.price}</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        variant="ghost" 
                        className="flex-1 rounded-xl h-11 font-black text-[9px] uppercase gap-2 hover:bg-primary/5" 
                        onClick={() => { 
                          setEditingItem(item); 
                          setMenuFormData({ ...item, price: item.price.toString() }); 
                          setIsMenuDialogOpen(true); 
                        }}
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="rounded-xl h-11 px-4 text-destructive hover:bg-red-50" 
                        onClick={() => { 
                          if(confirm("Delete item?")) {
                            deleteDoc(doc(db, 'products', item.id));
                          }
                        }}
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="marketing">
             <Card className="rounded-[4rem] border-none shadow-3xl bg-white p-12 md:p-24 relative overflow-hidden">
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
                <div className="max-w-4xl relative z-10">
                  <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 transform -rotate-6">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">AI Synthesis</h3>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-50">Generate viral narratives in seconds</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
                    {dbMenu?.slice(0, 12).map((item: any) => (
                      <button 
                        key={item.id} 
                        onClick={() => setSelectedPromoDish(item)} 
                        className={cn(
                          "p-6 rounded-[2rem] border-2 text-[10px] font-black uppercase transition-all text-center h-full",
                          selectedPromoDish?.id === item.id 
                            ? "border-primary bg-primary text-white scale-105 shadow-2xl" 
                            : "border-muted hover:border-primary/20 bg-white/50"
                        )}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="rounded-[2.5rem] h-20 px-16 font-black uppercase tracking-widest text-[12px] gap-4 shadow-2xl shadow-primary/40 w-full sm:w-auto bg-primary text-white transition-all active:scale-95" 
                    onClick={async () => {
                      if (!selectedPromoDish) return;
                      setPromoLoading(true);
                      try {
                        const res = await dailySpecialGenerator({ dishName: selectedPromoDish.name, basePrice: selectedPromoDish.price, discountPercent: 15 });
                        setPromoResult(res);
                      } finally { 
                        setPromoLoading(false); 
                      }
                    }} 
                    disabled={promoLoading || !selectedPromoDish}
                  >
                    {promoLoading ? <Loader2 className="animate-spin w-8 h-8" /> : <Megaphone className="w-8 h-8" />} Generate Viral Copy
                  </Button>

                  {promoResult && (
                    <div className="mt-20 p-12 bg-primary/5 rounded-[4rem] border-2 border-primary/10 space-y-8 animate-in zoom-in duration-500">
                      <h4 className="text-4xl md:text-5xl font-black font-headline leading-tight">{promoResult.promoTitle} {promoResult.emoji}</h4>
                      <p className="text-xl md:text-3xl font-medium italic opacity-80 leading-relaxed">"{promoResult.promoDescription}"</p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-10 border-t border-primary/10 gap-8">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Promo Pricing</p>
                           <p className="text-4xl font-black text-primary italic">₹{promoResult.finalPrice}</p>
                        </div>
                        <Button className="w-full sm:w-auto rounded-3xl h-16 px-12 font-black uppercase text-[10px] tracking-widest bg-primary" onClick={() => { 
                          navigator.clipboard.writeText(`${promoResult.promoTitle}\n\n${promoResult.promoDescription}\n\nOrder now for ₹${promoResult.finalPrice}!`); 
                          toast({ title: "Narrative Copied" }); 
                        }}>
                          Copy for Social Media
                        </Button>
                      </div>
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
