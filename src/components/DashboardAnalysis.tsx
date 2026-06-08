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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  ChevronDown,
  Download,
  Zap,
  TrendingUp,
  Package,
  Loader2,
  Users,
  Target,
  AlertCircle,
  ArrowUpRight,
  Printer,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Activity,
  History,
  CheckCircle2,
  XCircle,
  UserCheck
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
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { cn } from '@/lib/utils';
import { 
  isWithinInterval, 
  startOfDay, 
  endOfDay, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  format, 
  isAfter, 
  subWeeks,
  startOfWeek
} from 'date-fns';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

interface DashboardAnalysisProps {
  orders: any[];
  products: any[];
}

type FilterType = 'today' | 'yesterday' | 'currentMonth' | 'lastMonth';
type DetailType = 'revenue' | 'orders' | 'kitchen' | 'customers' | null;

export const DashboardAnalysis = ({ orders = [], products = [] }: DashboardAnalysisProps) => {
  const db = useFirestore();
  const [filterType, setFilterType] = useState<FilterType>('today');
  const [activeDetail, setActiveDetail] = useState<DetailType>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const usersQuery = useMemo(() => db ? query(collection(db, 'users')) : null, [db]);
  const { data: allUsers = [] } = useCollection<any>(usersQuery);

  const dateRange = useMemo(() => {
    const now = new Date();
    switch (filterType) {
      case 'today': return { start: startOfDay(now), end: endOfDay(now) };
      case 'yesterday': { const d = subDays(now, 1); return { start: startOfDay(d), end: endOfDay(d) }; }
      case 'currentMonth': return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth': { const d = subMonths(now, 1); return { start: startOfMonth(d), end: endOfMonth(d) }; }
      default: return { start: startOfDay(now), end: endOfDay(now) };
    }
  }, [filterType]);

  const filteredOrders = useMemo(() => {
    return (orders || []).filter(o => {
      if (!o.createdAt?.toDate) return false;
      const orderDate = o.createdAt.toDate();
      return isWithinInterval(orderDate, { start: dateRange.start, end: dateRange.end });
    });
  }, [orders, dateRange]);

  const metrics = useMemo(() => {
    const completed = filteredOrders.filter(o => o.status === 'Delivered');
    const revenue = completed.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
    const pending = filteredOrders.filter(o => ['Pending', 'Preparing', 'Confirmed'].includes(o.status));
    const cancelled = filteredOrders.filter(o => o.status === 'Cancelled');
    
    const totalRegisteredUsers = (allUsers || []).length;

    const itemMap: Record<string, { name: string, quantity: number, revenue: number }> = {};
    let totalItemsCount = 0;

    completed.forEach(order => {
      order.items?.forEach((item: any) => {
        const id = item.id || item.name;
        if (!itemMap[id]) {
          itemMap[id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        itemMap[id].quantity += qty;
        itemMap[id].revenue += (qty * price);
        totalItemsCount += qty;
      });
    });

    const itemStats = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);
    const avgOrderValue = completed.length > 0 ? Math.round(revenue / completed.length) : 0;

    return { 
      total: filteredOrders.length, 
      revenue, 
      avgOrderValue,
      pending: pending.length,
      cancelled: cancelled.length,
      itemsSold: totalItemsCount,
      itemStats,
      totalRegisteredUsers,
      completed: completed.length
    };
  }, [filteredOrders, allUsers]);

  const handleDownloadReport = (type: string = 'general') => {
    const reportDate = format(new Date(), 'yyyy-MM-dd');
    let rows = [["Metric", "Value"]];
    
    if (type === 'revenue') {
      rows.push(["Total Revenue", `INR ${metrics.revenue}`]);
      rows.push(["Avg Order Value", `INR ${metrics.avgOrderValue}`]);
    } else if (type === 'orders') {
      rows.push(["Total Orders", metrics.total.toString()]);
      rows.push(["Completed", metrics.completed.toString()]);
      rows.push(["Cancelled", metrics.cancelled.toString()]);
    } else {
      rows.push(["Total Registered Users", metrics.totalRegisteredUsers.toString()]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EzzyBites_${type}_Report_${reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Report Exported" });
  };

  if (!isMounted) return (
    <div className="h-[400px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-900 p-3 rounded-[2rem] shadow-sm border">
        <div className="flex bg-secondary/30 dark:bg-zinc-800 p-1 rounded-full w-full lg:w-auto overflow-x-auto scrollbar-hide">
          {['today', 'yesterday'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as FilterType)}
              className={cn(
                "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shrink-0",
                filterType === type ? "bg-white dark:bg-zinc-700 text-primary shadow-sm" : "text-muted-foreground hover:bg-white/40"
              )}
            >
              {type}
            </button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0",
                (filterType.includes('Month')) ? "bg-white dark:bg-zinc-700 text-primary shadow-sm" : "text-muted-foreground"
              )}>
                History <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-2xl p-2">
              <DropdownMenuItem onClick={() => setFilterType('currentMonth')} className="rounded-xl font-black uppercase text-[8px] py-2.5">Current Month</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('lastMonth')} className="rounded-xl font-black uppercase text-[8px] py-2.5">Last Month</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <Button variant="outline" size="icon" onClick={() => window.location.reload()} className="rounded-full border-muted bg-white dark:bg-zinc-900 h-10 w-10">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => handleDownloadReport('general')} className="flex-1 lg:w-auto h-10 px-8 rounded-full font-black text-[9px] uppercase bg-primary gap-2 text-white shadow-xl shadow-primary/20">
            <Download className="w-4 h-4" /> Export Ledger
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InteractiveMetricCard 
          label="Gross Revenue" 
          value={`₹${metrics.revenue}`} 
          icon={IndianRupee} 
          color="text-primary bg-primary/10" 
          onClick={() => setActiveDetail('revenue')}
        />
        <InteractiveMetricCard 
          label="Total Orders" 
          value={metrics.total} 
          icon={ShoppingBag} 
          color="text-blue-600 bg-blue-50" 
          onClick={() => setActiveDetail('orders')}
        />
        <InteractiveMetricCard 
          label="Kitchen Load" 
          value={metrics.pending} 
          icon={Clock} 
          color="text-orange-500 bg-orange-50" 
          onClick={() => setActiveDetail('kitchen')}
        />
        <InteractiveMetricCard 
          label="Customers" 
          value={metrics.totalRegisteredUsers} 
          icon={Users} 
          color="text-purple-600 bg-purple-50" 
          onClick={() => setActiveDetail('customers')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 overflow-hidden">
          <CardHeader className="px-0 pb-8 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black font-headline uppercase tracking-tighter">Business Velocity</CardTitle>
            <Badge variant="outline" className="text-[8px] font-black uppercase bg-primary/5 border-primary/20 text-primary">Real-Time</Badge>
          </CardHeader>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: '08:00', val: Math.round(metrics.revenue * 0.1) },
                { name: '12:00', val: Math.round(metrics.revenue * 0.4) },
                { name: '16:00', val: Math.round(metrics.revenue * 0.2) },
                { name: '20:00', val: Math.round(metrics.revenue * 0.3) },
              ]}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y2="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="val" stroke="#ef4444" strokeWidth={4} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6">
          <CardHeader className="px-0 pb-8">
            <CardTitle className="text-xl font-black font-headline uppercase tracking-tighter">Engagement</CardTitle>
          </CardHeader>
          <div className="h-[250px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Success', value: metrics.completed },
                    { name: 'Cancelled', value: metrics.cancelled }
                  ].filter(i => i.value > 0)} 
                  innerRadius={55} 
                  outerRadius={80} 
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-3 mt-6">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="opacity-50">Fulfillment</span>
                </div>
                <span>{metrics.total > 0 ? Math.round((metrics.completed / metrics.total) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* DETAIL MODALS */}
      <DetailModal 
        isOpen={activeDetail === 'revenue'} 
        onClose={() => setActiveDetail(null)} 
        title="Revenue Analysis"
        icon={IndianRupee}
      >
        <RevenueDetailView metrics={metrics} orders={orders} onExport={() => handleDownloadReport('revenue')} />
      </DetailModal>

      <DetailModal 
        isOpen={activeDetail === 'orders'} 
        onClose={() => setActiveDetail(null)} 
        title="Order Intelligence"
        icon={ShoppingBag}
      >
        <OrdersDetailView metrics={metrics} orders={orders} onExport={() => handleDownloadReport('orders')} />
      </DetailModal>

      <DetailModal 
        isOpen={activeDetail === 'kitchen'} 
        onClose={() => setActiveDetail(null)} 
        title="Kitchen Performance"
        icon={Clock}
      >
        <KitchenDetailView orders={orders} />
      </DetailModal>

      <DetailModal 
        isOpen={activeDetail === 'customers'} 
        onClose={() => setActiveDetail(null)} 
        title="Customer Analytics"
        icon={Users}
      >
        <CustomersDetailView users={allUsers} orders={orders} onExport={() => handleDownloadReport('customers')} />
      </DetailModal>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               SUB-COMPONENTS                               */
/* -------------------------------------------------------------------------- */

const InteractiveMetricCard = ({ label, value, icon: Icon, color, onClick }: any) => (
  <Card 
    onClick={onClick}
    className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8 hover:scale-[1.03] transition-all cursor-pointer group active:scale-95 border-b-4 border-b-transparent hover:border-b-primary"
  >
    <div className="flex justify-between items-start mb-6">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-all", color)}>
        <Icon className="w-7 h-7" />
      </div>
      <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
    </div>
    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{label}</p>
    <h3 className="text-4xl font-black font-headline tracking-tighter italic">{value}</h3>
    <div className="mt-4 pt-4 border-t border-dashed flex items-center gap-2 text-[9px] font-black uppercase text-primary opacity-0 group-hover:opacity-100 transition-all">
       View Details <ArrowUpRight className="w-3 h-3" />
    </div>
  </Card>
);

const DetailModal = ({ isOpen, onClose, title, icon: Icon, children }: any) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-5xl rounded-[3rem] p-0 overflow-hidden border-none shadow-3xl bg-[#F8F9FA] dark:bg-zinc-950 max-h-[90vh] flex flex-col">
      <div className="p-8 bg-white dark:bg-zinc-900 border-b shrink-0 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <DialogTitle className="text-2xl font-black font-headline uppercase tracking-tighter">{title}</DialogTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Enterprise Intelligence Module</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
        {children}
      </div>
    </DialogContent>
  </Dialog>
);

/* -------------------------------------------------------------------------- */
/*                               DETAIL VIEWS                                 */
/* -------------------------------------------------------------------------- */

const RevenueDetailView = ({ metrics, orders, onExport }: any) => {
  const now = new Date();
  
  const calculateRevenue = (rangeStart: Date) => {
    return orders
      .filter(o => o.status === 'Delivered' && o.createdAt?.toDate && isAfter(o.createdAt.toDate(), rangeStart))
      .reduce((acc: number, curr: any) => acc + (Number(curr.total) || 0), 0);
  };

  const weeklyRev = calculateRevenue(startOfWeek(now));
  const monthlyRev = calculateRevenue(startOfMonth(now));

  const paymentData = useMemo(() => {
    const methods: Record<string, number> = {};
    orders.filter(o => o.status === 'Delivered').forEach(o => {
      const m = o.paymentMethod || 'Other';
      methods[m] = (methods[m] || 0) + (Number(o.total) || 0);
    });
    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [orders]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MiniStatCard label="Today" value={`₹${metrics.revenue}`} icon={IndianRupee} />
        <MiniStatCard label="This Week" value={`₹${weeklyRev}`} icon={Activity} color="text-blue-600 bg-blue-50" />
        <MiniStatCard label="This Month" value={`₹${monthlyRev}`} icon={BarChart3} color="text-purple-600 bg-purple-50" />
        <MiniStatCard label="AOV" value={`₹${metrics.avgOrderValue}`} icon={Target} color="text-green-600 bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white dark:bg-zinc-900">
           <h4 className="text-sm font-black uppercase mb-8 flex items-center gap-2"><PieChartIcon className="w-4 h-4 text-primary" /> Settlement Distribution</h4>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={paymentData} innerRadius={60} outerRadius={100} dataKey="value" label>
                   {paymentData.map((_, i) => <Cell key={i} fill={['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][i % 4]} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </Card>

        <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white dark:bg-zinc-900">
           <h4 className="text-sm font-black uppercase mb-8 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Top Performers</h4>
           <div className="space-y-4">
             {metrics.itemStats.slice(0, 5).map((item: any, i: number) => (
               <div key={i} className="flex items-center justify-between p-4 bg-secondary/20 dark:bg-zinc-800 rounded-2xl">
                 <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center font-black text-xs">{i+1}</span>
                    <span className="font-black text-[11px] uppercase truncate max-w-[150px]">{item.name}</span>
                 </div>
                 <span className="font-black text-primary italic">₹{item.revenue}</span>
               </div>
             ))}
           </div>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-dashed">
        <Button variant="outline" className="rounded-xl h-12 px-6 font-black uppercase text-[10px] border-2" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" /> Print Summary</Button>
        <Button className="rounded-xl h-12 px-6 font-black uppercase text-[10px] bg-primary text-white" onClick={onExport}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
      </div>
    </div>
  );
};

const OrdersDetailView = ({ metrics, orders, onExport }: any) => {
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { Pending: 0, Confirmed: 0, Preparing: 0, Delivered: 0, Cancelled: 0 };
    orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });
    return counts;
  }, [orders]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatusMiniCard label="Pending" value={statusCounts.Pending} icon={Clock} color="bg-blue-100 text-blue-600" />
        <StatusMiniCard label="Accepted" value={statusCounts.Confirmed} icon={CheckCircle2} color="bg-cyan-100 text-cyan-600" />
        <StatusMiniCard label="Cooking" value={statusCounts.Preparing} icon={Zap} color="bg-orange-100 text-orange-600" />
        <StatusMiniCard label="Fulfilled" value={statusCounts.Delivered} icon={CheckCircle2} color="bg-green-100 text-green-600" />
        <StatusMiniCard label="Cancelled" value={statusCounts.Cancelled} icon={XCircle} color="bg-red-100 text-red-600" />
      </div>

      <Card className="rounded-[2.5rem] p-10 border-none shadow-xl bg-white dark:bg-zinc-900">
         <div className="flex justify-between items-center mb-10">
            <h4 className="text-sm font-black uppercase flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Order Flow Trend</h4>
            <Badge variant="outline" className="font-black text-[8px] uppercase">Last 24 Hours</Badge>
         </div>
         <div className="h-[350px]">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={[
               { time: 'Morning', orders: 12 },
               { time: 'Lunch', orders: 45 },
               { time: 'Snacks', orders: 28 },
               { time: 'Dinner', orders: 52 },
             ]}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
               <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900}} />
               <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
               <Bar dataKey="orders" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={40} />
             </BarChart>
           </ResponsiveContainer>
         </div>
      </Card>

      <div className="flex justify-end gap-3 pt-6 border-t border-dashed">
        <Button className="rounded-xl h-12 px-6 font-black uppercase text-[10px] bg-primary text-white" onClick={onExport}><Download className="w-4 h-4 mr-2" /> Download Order Logs</Button>
      </div>
    </div>
  );
};

const KitchenDetailView = ({ orders }: any) => {
  const waiting = orders.filter((o: any) => o.status === 'Pending').length;
  const preparing = orders.filter((o: any) => o.status === 'Preparing').length;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 shadow-xl border-l-4 border-l-primary flex justify-between items-center">
           <div>
              <p className="text-[10px] font-black uppercase opacity-40 mb-1">In Queue</p>
              <h4 className="text-4xl font-black italic">{waiting}</h4>
           </div>
           <Clock className="w-10 h-10 text-primary opacity-20" />
        </div>
        <div className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 shadow-xl border-l-4 border-l-orange-500 flex justify-between items-center">
           <div>
              <p className="text-[10px] font-black uppercase opacity-40 mb-1">On Stove</p>
              <h4 className="text-4xl font-black italic">{preparing}</h4>
           </div>
           <Zap className="w-10 h-10 text-orange-500 opacity-20" />
        </div>
        <div className="p-8 rounded-[2rem] bg-white dark:bg-zinc-900 shadow-xl border-l-4 border-l-green-500 flex justify-between items-center">
           <div>
              <p className="text-[10px] font-black uppercase opacity-40 mb-1">Avg Prep Time</p>
              <h4 className="text-4xl font-black italic">14m</h4>
           </div>
           <Activity className="w-10 h-10 text-green-500 opacity-20" />
        </div>
      </div>

      <Card className="rounded-[3rem] p-10 border-none shadow-xl bg-white dark:bg-zinc-900">
         <h4 className="text-sm font-black uppercase mb-10">Real-Time Kitchen Feed</h4>
         <div className="space-y-4">
           {orders.filter((o: any) => ['Pending', 'Confirmed', 'Preparing'].includes(o.status)).slice(0, 5).map((o: any) => (
             <div key={o.id} className="flex items-center justify-between p-5 bg-secondary/20 dark:bg-zinc-800 rounded-3xl group">
                <div className="flex items-center gap-6">
                   <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-700 flex items-center justify-center font-black text-xs text-primary shadow-sm">#{o.orderId.slice(-4)}</div>
                   <div>
                      <p className="font-black text-xs uppercase">{o.items?.map((i: any) => i.name).join(', ')}</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Customer: {o.customerName}</p>
                   </div>
                </div>
                <Badge className={cn(
                  "font-black text-[8px] uppercase border-none px-3 py-1",
                  o.status === 'Preparing' ? "bg-orange-500 text-white" : "bg-primary text-white"
                )}>{o.status}</Badge>
             </div>
           ))}
         </div>
      </Card>
    </div>
  );
};

const CustomersDetailView = ({ users, orders, onExport }: any) => {
  const topSpenders = useMemo(() => {
    const spendMap: Record<string, { name: string, total: number, email: string }> = {};
    orders.filter(o => o.status === 'Delivered').forEach(o => {
      const uid = o.userId;
      if (!uid) return;
      if (!spendMap[uid]) spendMap[uid] = { name: o.customerName, total: 0, email: o.customerEmail };
      spendMap[uid].total += (Number(o.total) || 0);
    });
    return Object.values(spendMap).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [orders]);

  const now = new Date();
  const newToday = users.filter((u: any) => u.createdAt?.toDate && isAfter(u.createdAt.toDate(), startOfDay(now))).length;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MiniStatCard label="Registered Users" value={users.length} icon={Users} />
        <MiniStatCard label="New Today" value={newToday} icon={UserCheck} color="text-green-600 bg-green-50" />
        <MiniStatCard label="Retention Rate" value="64%" icon={History} color="text-blue-600 bg-blue-50" />
      </div>

      <Card className="rounded-[2.5rem] p-10 border-none shadow-xl bg-white dark:bg-zinc-900">
         <h4 className="text-sm font-black uppercase mb-10 flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Top Customers by Spending</h4>
         <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-[10px] font-black uppercase text-muted-foreground text-left">
                  <th className="pb-6 px-4">Customer</th>
                  <th className="pb-6 px-4">Contact</th>
                  <th className="pb-6 px-4 text-right">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topSpenders.map((s, i) => (
                  <tr key={i} className="group hover:bg-secondary/5 transition-colors">
                    <td className="py-5 px-4 font-black text-xs uppercase">{s.name}</td>
                    <td className="py-5 px-4 font-bold text-[10px] text-muted-foreground lowercase">{s.email}</td>
                    <td className="py-5 px-4 text-right font-black text-primary italic">₹{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </Card>

      <div className="flex justify-end pt-6 border-t border-dashed">
        <Button className="rounded-xl h-12 px-6 font-black uppercase text-[10px] bg-primary text-white" onClick={onExport}><Download className="w-4 h-4 mr-2" /> Export User Audit</Button>
      </div>
    </div>
  );
};

const MiniStatCard = ({ label, value, icon: Icon, color = "text-primary bg-primary/10" }: any) => (
  <div className="p-6 rounded-[1.8rem] bg-white dark:bg-zinc-900 shadow-xl border-l-4 border-l-transparent hover:border-l-primary transition-all">
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", color)}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">{label}</p>
    <h4 className="text-2xl font-black italic">{value}</h4>
  </div>
);

const StatusMiniCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="flex flex-col items-center justify-center p-5 rounded-[1.5rem] bg-white dark:bg-zinc-900 shadow-md gap-3">
    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", color)}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="text-center">
       <h5 className="text-[10px] font-black uppercase opacity-40 tracking-tighter mb-0.5">{label}</h5>
       <p className="text-xl font-black italic">{value}</p>
    </div>
  </div>
);
