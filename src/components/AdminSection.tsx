
"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, Users, IndianRupee, MessageSquare, Sparkles, Loader2, 
  TrendingUp, Package, Clock, CheckCircle2, AlertCircle, ShoppingCart,
  ArrowUpRight, MoreHorizontal
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MENU_ITEMS } from '@/app/lib/menu-data';
import { reviewSummaryGenerator } from '@/ai/flows/review-summary-generator';

const MOCK_REVIEWS: Record<string, string[]> = {
  '1': [
    "The spices are perfectly balanced, absolutely loved the Classic Veg Maggie!",
    "A bit too much onion for my taste, but the noodles were perfectly cooked.",
    "Best snack on campus, affordable and tasty.",
    "The delivery was super fast, arrived hot!"
  ],
  '3': [
    "The Chicken Biryani is authentic Hyderabadi style. Very spicy and aromatic.",
    "Chicken was tender but I wish the portion size was slightly larger for the price.",
    "Amazing flavors, definitely my go-to weekend meal.",
    "Rice was a bit dry today, but usually it's perfect."
  ],
  '5': [
    "Perfect dessert! The chocolate syrup is rich and the nuts add a great crunch.",
    "A bit too sweet, but my kids loved it.",
    "Best sundae I've had in a long time. Presentation was great even for delivery."
  ]
};

const RECENT_ORDERS = [
  { id: "#EB-9231", customer: "Rahul Sharma", items: "Chicken Biryani, Coke", total: "₹289", status: "Delivered", time: "10 mins ago" },
  { id: "#EB-9232", customer: "Priya V.", items: "Veg Maggie, Sundae", total: "₹218", status: "Preparing", time: "15 mins ago" },
  { id: "#EB-9233", customer: "Anand K.", items: "Paneer Momos (x2)", total: "₹258", status: "Pending", time: "22 mins ago" },
  { id: "#EB-9234", customer: "Sneha G.", items: "Egg Maggie Special", total: "₹89", status: "Delivered", time: "45 mins ago" },
  { id: "#EB-9235", customer: "Vikram R.", items: "Hyderabadi Biryani (x3)", total: "₹747", status: "Cancelled", time: "1 hour ago" },
];

export const AdminSection = () => {
  const [selectedDish, setSelectedDish] = useState('1');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const reviews = MOCK_REVIEWS[selectedDish] || ["Good food", "Nice experience"];
      const result = await reviewSummaryGenerator({ reviews });
      setSummary(result.summary);
    } catch (error) {
      console.error(error);
      setSummary("Failed to generate summary. AI service is currently busy.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Today's Revenue", value: "₹42,500", trend: "+12.5%", icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
    { label: "Orders Today", value: "128", trend: "+8.2%", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "New Customers", value: "32", trend: "+24%", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Kitchen Load", value: "High", trend: "Busy", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
              <Sparkles className="w-3 h-3" />
              Intelligence Core
            </div>
            <h1 className="text-4xl font-headline font-black tracking-tight">Management <span className="text-primary">Dashboard</span></h1>
            <p className="text-muted-foreground font-medium">Monitoring the pulse of Easy Bites Cafe.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl border-primary text-primary font-bold hover:bg-primary/5">
              Download Report
            </Button>
            <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
              Kitchen View
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {stats.map((stat, i) => (
            <Card key={i} className="border-none shadow-xl bg-card rounded-3xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold border-muted-foreground/20">
                    {stat.trend}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="insights" className="space-y-8">
          <TabsList className="bg-card p-1 rounded-2xl border w-full md:w-auto shadow-sm">
            <TabsTrigger value="insights" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <BarChart3 className="w-4 h-4 mr-2" />
              Live Insights
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Active Orders
            </TabsTrigger>
            <TabsTrigger value="feedback" className="rounded-xl px-8 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="animate-in fade-in slide-in-from-bottom duration-500">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Chart */}
              <Card className="lg:col-span-2 rounded-3xl border-none shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
                  <div>
                    <CardTitle className="text-xl font-bold">Sales Volume</CardTitle>
                    <CardDescription>Hourly order distribution today</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-10 pb-6">
                  <div className="h-[250px] flex items-end gap-3 px-4">
                    {[35, 55, 42, 85, 60, 75, 50, 65, 90, 100, 65, 45].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                          className="w-full bg-primary/10 rounded-t-xl group-hover:bg-primary transition-all duration-300 relative"
                          style={{ height: `${h}%` }}
                        >
                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                            {h}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">{i + 8}h</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Side Stats */}
              <div className="space-y-8">
                <Card className="rounded-3xl border-none shadow-xl bg-primary text-white overflow-hidden relative">
                  <TrendingUp className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10" />
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Goal</CardTitle>
                    <CardDescription className="text-white/70">Progress towards ₹50k target</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-end">
                      <h4 className="text-4xl font-black">85%</h4>
                      <span className="text-sm font-bold opacity-80">₹7,500 left</span>
                    </div>
                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: '85%' }} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-none shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">Top Performing Dish</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center font-bold text-primary">
                        #1
                      </div>
                      <div>
                        <h4 className="font-black text-xl">Chicken Biryani</h4>
                        <p className="text-sm text-muted-foreground">48 orders today</p>
                      </div>
                      <div className="ml-auto">
                        <ArrowUpRight className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="animate-in fade-in slide-in-from-bottom duration-500">
            <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold">Order ID</TableHead>
                    <TableHead className="font-bold">Customer</TableHead>
                    <TableHead className="font-bold">Items</TableHead>
                    <TableHead className="font-bold text-right">Total</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Time</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RECENT_ORDERS.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs font-bold">{order.id}</TableCell>
                      <TableCell className="font-bold">{order.customer}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{order.items}</TableCell>
                      <TableCell className="text-right font-black">{order.total}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                            order.status === 'Preparing' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                            order.status === 'Pending' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' :
                            'bg-red-100 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{order.time}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <CardFooter className="bg-muted/20 p-4 flex justify-center border-t">
                <Button variant="link" className="text-primary font-bold">View Full Order History</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="animate-in fade-in slide-in-from-bottom duration-500">
             <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Card className="rounded-3xl border-none shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Select a Dish
                    </CardTitle>
                    <CardDescription>AI will analyze recent feedback for this item.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {MENU_ITEMS.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedDish(item.id)}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                          selectedDish === item.id 
                            ? 'border-primary bg-primary/5 shadow-inner' 
                            : 'border-transparent bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-black text-sm">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category}</span>
                        </div>
                        {MOCK_REVIEWS[item.id] && (
                          <div className="flex -space-x-2">
                             {[1,2,3].map(i => (
                               <div key={i} className="w-5 h-5 rounded-full bg-secondary border-2 border-background" />
                             ))}
                             <div className="w-5 h-5 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[8px] font-bold text-primary">
                               +{MOCK_REVIEWS[item.id].length}
                             </div>
                          </div>
                        )}
                      </button>
                    ))}
                    <Button 
                      className="w-full h-14 rounded-2xl mt-4 font-black text-lg gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                      onClick={handleGenerateSummary}
                      disabled={loading || !MOCK_REVIEWS[selectedDish]}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Summarize Feedback
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="rounded-3xl border-none shadow-xl h-full flex flex-col overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b pb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                          <MessageSquare className="w-6 h-6 text-white" />
                       </div>
                       <div>
                          <CardTitle className="text-xl font-bold">AI Customer Insights</CardTitle>
                          <CardDescription>Synthesized sentiment based on real reviews</CardDescription>
                       </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 flex-1 flex flex-col justify-center items-center text-center relative">
                    {summary ? (
                      <div className="space-y-8 animate-in zoom-in duration-500">
                        <div className="relative">
                          <div className="absolute -top-6 -left-4 text-6xl text-primary/10 font-serif">“</div>
                          <div className="p-8 rounded-[40px] bg-secondary/50 border border-primary/10 text-xl md:text-2xl leading-relaxed italic font-medium text-foreground/90">
                            {summary}
                          </div>
                          <div className="absolute -bottom-10 -right-4 text-6xl text-primary/10 font-serif">”</div>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                           <div className="flex gap-2">
                              <Badge className="bg-green-100 text-green-700 border-none font-bold">High Popularity</Badge>
                              <Badge className="bg-blue-100 text-blue-700 border-none font-bold">Actionable Data</Badge>
                           </div>
                           <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Genkit Intelligence Active
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                           <Sparkles className="w-12 h-12" />
                        </div>
                        <h4 className="text-2xl font-black text-muted-foreground/50">Ready to Analyze</h4>
                        <p className="text-muted-foreground max-w-xs">Select a dish from the list to start the AI feedback summarization process.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
