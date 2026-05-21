"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Users, IndianRupee, MessageSquare, Sparkles, Loader2, TrendingUp, Package } from 'lucide-react';
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
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Total Orders", value: "1,284", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Revenue", value: "₹42,500", icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active Users", value: "856", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Growth", value: "+12.5%", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <section className="py-20 bg-muted/50 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mb-3">
              <BarChart3 className="w-3 h-3" />
              ADMIN DASHBOARD
            </div>
            <h2 className="text-3xl font-headline font-bold">Business Insights</h2>
            <p className="text-muted-foreground">Manage your cafe operations and analyze customer feedback.</p>
          </div>
          <Button variant="outline" className="rounded-xl border-primary text-primary font-bold">
            Full Admin Panel
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-background p-1 rounded-xl border">
            <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg px-6">AI Feedback Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, i) => (
                <Card key={i} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <Badge variant="secondary" className="bg-background border font-mono">LIVE</Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-black">{stat.value}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Order Flow</CardTitle>
                <CardDescription>Visualizing real-time order volume across the day.</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px] flex items-end gap-2 md:gap-4 px-6 pb-10">
                {[40, 60, 45, 90, 65, 80, 50, 70, 85, 95, 60, 40].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-primary/20 rounded-t-lg relative group transition-all hover:bg-primary"
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {h} orders
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Select a Dish
                    </CardTitle>
                    <CardDescription>Choose a dish to analyze its recent customer reviews using AI.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {MENU_ITEMS.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedDish(item.id)}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${selectedDish === item.id ? 'border-primary bg-primary/5 shadow-inner' : 'hover:border-primary/50'}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">{item.name}</span>
                          {MOCK_REVIEWS[item.id] && <Badge variant="secondary" className="text-[10px]">{MOCK_REVIEWS[item.id].length} Reviews</Badge>}
                        </div>
                      </button>
                    ))}
                    <Button 
                      className="w-full h-12 rounded-xl mt-4 font-bold gap-2"
                      onClick={handleGenerateSummary}
                      disabled={loading || !MOCK_REVIEWS[selectedDish]}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Summarize Feedback
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="border-none shadow-sm h-full flex flex-col">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      AI Insights Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 flex-1 flex flex-col justify-center items-center text-center">
                    {summary ? (
                      <div className="space-y-4 animate-in slide-in-from-right duration-500">
                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 text-lg leading-relaxed italic text-foreground/80">
                          "{summary}"
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Generated by Genkit AI using {MOCK_REVIEWS[selectedDish]?.length || 0} customer reviews
                        </p>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-10" />
                        <p>Select a dish and click summarize to see AI-generated insights based on real customer feedback.</p>
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
