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
  AlertCircle,
  Hash,
  Activity,
  Flame,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface KitchenSystemProps {
  orders: any[];
  onUpdateStatus: (id: string, status: string) => void;
}

export const KitchenSystem = ({ orders, onUpdateStatus }: KitchenSystemProps) => {
  const kitchenOrders = orders.filter(o => 
    o.status === 'Confirmed' || o.status === 'Preparing'
  ).sort((a, b) => {
    if (a.status === 'Confirmed' && b.status !== 'Confirmed') return -1;
    if (a.status !== 'Confirmed' && b.status === 'Confirmed') return 1;
    return 0;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* KITCHEN HEADS-UP DISPLAY (HUD) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-orange-gradient text-white p-10 relative overflow-hidden group">
           <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
             <Flame className="w-40 h-40" />
           </div>
           <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="flex items-center gap-4 bg-white/20 w-fit px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                 <ChefHat className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Active Stations</span>
              </div>
              <div>
                <h3 className="text-6xl font-black font-headline tracking-tighter italic leading-none">{kitchenOrders.filter(o => o.status === 'Preparing').length}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-70 italic">Cooking In-Progress</p>
              </div>
           </div>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-10 relative overflow-hidden border border-primary/10">
           <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="flex items-center gap-4 bg-primary/10 text-primary w-fit px-4 py-1.5 rounded-full border border-primary/10">
                 <BellRing className="w-4 h-4 animate-bounce" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Incoming Tickets</span>
              </div>
              <div>
                <h3 className="text-6xl font-black font-headline tracking-tighter italic leading-none text-primary">{kitchenOrders.filter(o => o.status === 'Confirmed').length}</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-40 italic">Awaiting Prep Start</p>
              </div>
           </div>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-zinc-900 text-white p-10 relative overflow-hidden">
           <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="flex items-center gap-4 bg-white/10 w-fit px-4 py-1.5 rounded-full border border-white/10">
                 <Activity className="w-4 h-4 text-green-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Fleet Efficiency</span>
              </div>
              <div>
                <h3 className="text-6xl font-black font-headline tracking-tighter italic leading-none text-green-400">98%</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-40 italic">On-Time Accuracy</p>
              </div>
           </div>
        </Card>
      </div>

      {/* KITCHEN GRID / KDS BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {kitchenOrders.length === 0 ? (
          <div className="col-span-full py-48 text-center bg-white dark:bg-zinc-900 rounded-[4rem] border-2 border-dashed border-muted flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-24 bg-secondary/50 rounded-[3rem] flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-muted-foreground opacity-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Board Clear</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-40 italic">All dishes provisioned & dispatched</p>
            </div>
          </div>
        ) : (
          kitchenOrders.map((order) => (
            <Card 
              key={order.id} 
              className={cn(
                "rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white dark:bg-zinc-900 transition-all duration-500",
                order.status === 'Confirmed' ? "ring-8 ring-primary/5 border-2 border-primary/20" : "border-2 border-orange-500/20"
              )}
            >
              <div className={cn(
                "p-8 flex justify-between items-center",
                order.status === 'Confirmed' ? "bg-primary text-white" : "bg-orange-gradient text-white"
              )}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl border border-white/20">
                    {order.orderType === 'Dine-In' ? <Utensils className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Manifest ID</p>
                    <h4 className="font-black text-xl uppercase tracking-tighter leading-none italic">#{order.orderId}</h4>
                  </div>
                </div>
                <Badge className="bg-white/20 border-none font-black text-[9px] uppercase px-4 py-1.5 rounded-full tracking-widest">
                  {order.orderType || 'Standard'}
                </Badge>
              </div>

              <CardContent className="p-10 space-y-10">
                <div className="space-y-4">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex flex-col bg-zinc-50 dark:bg-zinc-800 p-6 rounded-[2rem] gap-3 group hover:bg-white dark:hover:bg-zinc-700 transition-all shadow-sm border border-transparent hover:border-primary/10">
                      <div className="flex justify-between items-center">
                        <span className="font-black text-lg uppercase tracking-tight flex-1 truncate pr-4">{item.name}</span>
                        <span className="w-12 h-12 rounded-[1.2rem] bg-primary text-white flex items-center justify-center font-black text-base shadow-xl">
                          x{item.quantity}
                        </span>
                      </div>
                      {item.customization && (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-zinc-200">
                           <Badge variant="outline" className="text-[8px] font-black uppercase text-primary border-primary/20 bg-primary/5 px-2">{item.customization.size}</Badge>
                           <Badge variant="outline" className="text-[8px] font-black uppercase px-2">{item.customization.temp}</Badge>
                           <Badge variant="outline" className="text-[8px] font-black uppercase px-2">Sugar: {item.customization.sugar}</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {order.instructions && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-[2rem] border-2 border-dashed border-blue-200 dark:border-blue-800 flex gap-4 animate-pulse">
                    <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-blue-600 mb-1 tracking-widest">Special Handling</p>
                      <p className="text-xs font-bold italic leading-relaxed text-blue-900 dark:text-blue-300">"{order.instructions}"</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-8 border-t border-dashed">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[8px] font-black uppercase text-muted-foreground opacity-40">Ticker Created</p>
                    <div className="flex items-center gap-2 text-xs font-black uppercase">
                       <Timer className="w-4 h-4 text-primary" />
                       {order.createdAt?.toDate ? format(order.createdAt.toDate(), 'hh:mm a') : 'Now'}
                    </div>
                  </div>
                  
                  {order.status === 'Confirmed' ? (
                    <Button 
                      onClick={() => onUpdateStatus(order.id, 'Preparing')}
                      className="rounded-[1.5rem] h-16 px-10 bg-primary font-black uppercase text-[11px] tracking-widest gap-3 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-95"
                    >
                      <ChefHat className="w-5 h-5" /> Start Cooking
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => onUpdateStatus(order.id, 'Out for Delivery')}
                      className="rounded-[1.5rem] h-16 px-10 bg-violet-600 font-black uppercase text-[11px] tracking-widest gap-3 shadow-2xl shadow-violet-500/30 transition-all hover:scale-[1.05] active:scale-95 text-white"
                    >
                      <Truck className="w-5 h-5" /> Dispatch
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
