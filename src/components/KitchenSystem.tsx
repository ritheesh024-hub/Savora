"use client"
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Timer,
  Package,
  Utensils,
  BellRing,
  Settings2,
  Truck,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KitchenSystemProps {
  orders: any[];
  onUpdateStatus: (id: string, status: string) => void;
}

export const KitchenSystem = ({ orders, onUpdateStatus }: KitchenSystemProps) => {
  // Filter for orders that need kitchen attention (Confirmed or Preparing)
  const kitchenOrders = orders.filter(o => 
    o.status === 'Confirmed' || o.status === 'Preparing'
  ).sort((a, b) => {
    // Show older Confirmed orders first, then Preparing
    if (a.status === 'Confirmed' && b.status !== 'Confirmed') return -1;
    if (a.status !== 'Confirmed' && b.status === 'Confirmed') return 1;
    return 0;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-none shadow-xl bg-orange-500 text-white p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
             <ChefHat className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Active Cooking</p>
              <h3 className="text-4xl font-black font-headline">{kitchenOrders.filter(o => o.status === 'Preparing').length}</h3>
            </div>
            <ChefHat className="w-8 h-8 opacity-20" />
          </div>
        </Card>
        <Card className="rounded-3xl border-none shadow-xl bg-primary text-white p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
             <BellRing className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">New Tickets</p>
              <h3 className="text-4xl font-black font-headline">{kitchenOrders.filter(o => o.status === 'Confirmed').length}</h3>
            </div>
            <BellRing className="w-8 h-8 opacity-20" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {kitchenOrders.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-muted">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Kitchen Queue Clear</p>
          </div>
        ) : (
          kitchenOrders.map((order) => (
            <Card 
              key={order.id} 
              className={cn(
                "rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white dark:bg-zinc-900 transition-all",
                order.status === 'Confirmed' ? "ring-4 ring-primary ring-inset" : "ring-1 ring-border"
              )}
            >
              <div className={cn(
                "p-5 flex justify-between items-center",
                order.status === 'Confirmed' ? "bg-primary text-white" : "bg-orange-500 text-white"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {order.orderType === 'Dine-In' ? <Utensils className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight">#{order.orderId}</h4>
                </div>
                <Badge className="bg-white/20 border-none font-black text-[9px] uppercase px-3 py-1">
                  {order.orderType || 'Online'}
                </Badge>
              </div>

              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex flex-col bg-secondary/30 dark:bg-zinc-800 p-4 rounded-2xl gap-2 group hover:bg-secondary/50 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-sm uppercase tracking-tight flex-1 truncate pr-2">{item.name}</span>
                        <span className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700 flex items-center justify-center font-black text-sm shadow-sm">
                          x{item.quantity}
                        </span>
                      </div>
                      {item.customization && (
                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-primary tracking-widest">
                          <Settings2 className="w-3 h-3" />
                          {item.customization.size} • {item.customization.temp} • Sugar: {item.customization.sugar}
                          {item.customization.addons?.length > 0 && ` • Extras: ${item.customization.addons.join(', ')}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {order.instructions && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex gap-3">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Chef Note</p>
                      <p className="text-[11px] font-bold italic leading-relaxed text-blue-900 dark:text-blue-300">"{order.instructions}"</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-dashed">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-40">
                    <Timer className="w-3.5 h-3.5" />
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </div>
                  
                  {order.status === 'Confirmed' ? (
                    <Button 
                      onClick={() => onUpdateStatus(order.id, 'Preparing')}
                      className="rounded-xl h-12 px-6 bg-primary font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <ChefHat className="w-4 h-4" /> Start Cooking
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => onUpdateStatus(order.id, 'Out for Delivery')}
                      className="rounded-xl h-12 px-6 bg-purple-500 font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                      <Truck className="w-4 h-4" /> Dispatch
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
