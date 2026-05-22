'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  IndianRupee,
  Clock,
  Download,
  Sparkles,
  Star,
  ChevronDown,
  Loader2
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { 
  format, 
  isWithinInterval, 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  subMonths 
} from 'date-fns';

interface DashboardAnalysisProps {
  orders: any[];
  products: any[];
}

type FilterType = 'today' | 'yesterday' | 'currentMonth' | 'lastMonth';

export const DashboardAnalysis = ({ orders, products }: DashboardAnalysisProps) => {
  const [filterType, setFilterType] = useState<FilterType>('today');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Intelligent Date Range Calculation - Defer until mount to prevent hydration mismatch
  const dateRange = useMemo(() => {
    if (!isMounted) return { start: new Date(), end: new Date() };
    const now = new Date();
    switch (filterType) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday':
        const yesterday = subDays(now, 1);
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
      case 'currentMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  }, [filterType, isMounted]);

  const filteredOrders = useMemo(() => {
    if (!orders || !isMounted) return [];
    
    return orders.filter(o => {
      if (!o.createdAt?.toDate) return false;
      const orderDate = o.createdAt.toDate();
      return isWithinInterval(orderDate, { start: dateRange.start, end: dateRange.end });
    });
  }, [orders, dateRange, isMounted]);

  const metrics = useMemo(() => {
    const completed = filteredOrders.filter(o => o.status === 'Delivered');
    const revenue = completed.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const pending = filteredOrders.filter(o => ['Pending', 'Preparing', 'Out for Delivery'].includes(o.status)).length;
    const cancelled = filteredOrders.filter(o => o.status === 'Cancelled').length;

    return {
      total: filteredOrders.length,
      revenue,
      pending,
      completed: completed.length,
      cancelled,
      growth: filterType === 'today' ? 14.2 : 8.5
    };
  }, [filteredOrders, filterType]);

  const chartData = useMemo(() => {
    const isSingleDay = filterType === 'today' || filterType === 'yesterday';
    
    if (isSingleDay) {
      return [
        { name: '06:00', sales: metrics.revenue * 0.1 },
        { name: '10:00', sales: metrics.revenue * 0.2 },
        { name: '14:00', sales: metrics.revenue * 0.35 },
        { name: '18:00', sales: metrics.revenue * 0.25 },
        { name: '22:00', sales: metrics.revenue * 0.1 },
      ];
    }

    return [
      { name: 'Week 1', sales: metrics.revenue * 0.2 },
      { name: 'Week 2', sales: metrics.revenue * 0.3 },
      { name: 'Week 3', sales: metrics.revenue * 0.25 },
      { name: 'Week 4', sales: metrics.revenue * 0.25 },
    ];
  }, [metrics, filterType]);

  const statusDistribution = [
    { name: 'Completed', value: metrics.completed, color: '#ef4444' },
    { name: 'Pending', value: metrics.pending, color: '#f59e0b' },
    { name: 'Cancelled', value: metrics.cancelled, color: '#94a3b8' },
  ].filter(i => i.value > 0);

  if (!isMounted) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] border shadow-sm sticky top-0 z-[40]">
        <div className="flex flex-wrap gap-2 p-1.5 bg-secondary/40 rounded-2xl w-full lg:w-auto">
          {['today', 'yesterday'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as FilterType)}
              className={cn(
                "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filterType === type ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/40"
              )}
            >
              {type}
            </button>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  (filterType === 'currentMonth' || filterType === 'lastMonth') ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/40"
                )}
              >
                Month <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[180px] z-[50] shadow-2xl">
              <DropdownMenuItem onClick={() => setFilterType('currentMonth')} className="rounded-xl font-bold text-[10px] uppercase py-3 px-4">
                Current Month
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('lastMonth')} className="rounded-xl font-bold text-[10px] uppercase py-3 px-4">
                Last Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <Button onClick={() => toast({ title: "Compiling Report..." })} className="flex-1 lg:flex-none h-12 px-8 rounded-xl gap-3 font-black text-[10px] uppercase bg-primary shadow-xl shadow-primary/20">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Revenue" value={`₹${metrics.revenue.toLocaleString()}`} icon={IndianRupee} color="bg-red-50 text-primary" />
        <StatCard label="Orders" value={metrics.total.toString()} icon={ShoppingBag} color="bg-blue-50 text-blue-600" />
        <StatCard label="Live Load" value={metrics.pending.toString()} icon={Clock} color="bg-orange-50 text-orange-600" />
        <StatCard label="Rating" value="4.9" icon={Star} color="bg-yellow-50 text-yellow-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
          <CardHeader className="pb-8">
            <CardTitle className="text-xl font-black font-headline tracking-tight">Revenue Velocity</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] w-full px-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)'}} />
                <Area type="monotone" dataKey="sales" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-black font-headline tracking-tight">Order Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center justify-center p-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                  {statusDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-3 mt-6">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-foreground">{item.value} Orders</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <Card className="rounded-[2rem] border-none shadow-lg bg-white/90 backdrop-blur-xl">
    <CardContent className="p-8">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <h3 className="text-3xl font-black tracking-tighter truncate">{value}</h3>
    </CardContent>
  </Card>
);
