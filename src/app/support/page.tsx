'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, serverTimestamp, limit, doc, updateDoc } from 'firebase/firestore';
import { 
  Bot, Package, Phone, 
  RotateCcw, Send, Loader2, ChevronRight, 
  Mail, Ban, Star, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ezzySupportAI } from '@/ai/flows/support-ai-flow';
import { useGlobalSettings } from '@/hooks/use-global-settings';
import Link from 'next/link';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  type?: 'text' | 'options' | 'orders' | 'feedback' | 'contact' | 'chips' | 'items';
  options?: any[];
  protocolAction?: string;
};

export default function SupportPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const { settings } = useGlobalSettings();
  const scrollRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = { 
    id: 'welcome', 
    role: 'assistant', 
    content: '👋 Welcome to Ezzy Bites Support Hub. How can our fleet assist you today?',
    type: 'options' 
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const ordersQuery = useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));
  }, [db, user]);
  const { data: recentOrders, loading: ordersLoading } = useCollection<any>(ordersQuery);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addMessage = (role: 'assistant' | 'user', content: string, type: Message['type'] = 'text', options?: any[], action?: string) => {
    const newMsg: Message = { 
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
      role, 
      content, 
      type, 
      options,
      protocolAction: action
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleSendMessage = async (text?: string) => {
    const msg = text || inputText;
    if (!msg.trim() || isTyping) return;

    addMessage('user', msg);
    setInputText('');
    setIsTyping(true);

    try {
      const orderContext = selectedOrder ? JSON.stringify({
        orderId: selectedOrder.orderId,
        status: selectedOrder.status,
        items: selectedOrder.items,
        total: selectedOrder.total,
        createdAt: selectedOrder.createdAt?.toDate ? selectedOrder.createdAt.toDate().toISOString() : new Date().toISOString()
      }) : '';

      const settingsContext = settings ? `Open: ${settings.isOpen}, Contact: ${settings.contactNumber}` : '';

      const history = messages
        .filter(m => m.content && (m.type === 'text' || m.type === 'chips'))
        .map(m => ({
          role: m.role === 'assistant' ? 'model' as const : 'user' as const,
          content: m.content
        }));

      const response = await ezzySupportAI({
        message: msg,
        orderContext,
        settingsContext,
        chatHistory: history
      });

      addMessage('assistant', response.reply, response.suggestedActions?.length ? 'chips' : 'text', response.suggestedActions, response.protocolAction);
    } catch (e) {
      addMessage('assistant', "I'm currently unable to process your request. Please call our hotline directly.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleCategoryClick = (cat: any) => {
    if (isTyping) return;
    addMessage('user', cat.label);
    if (cat.id === 'order') {
      addMessage('assistant', 'Please select an order node for synchronization:', 'orders');
    } else if (cat.id === 'contact') {
      addMessage('assistant', 'Direct frequency nodes:', 'contact');
    } else {
      handleSendMessage(cat.label);
    }
  };

  const handleOrderSelect = (order: any) => {
    if (isTyping) return;
    setSelectedOrder(order);
    addMessage('user', `Tracking Ticket #${order.orderId}`);
    addMessage('assistant', `Sync established for Ticket #${order.orderId}. How can I assist with this specific order?`, 'chips', 
      ["Where is my order?", "Cancel my order", "Wrong item received", "Missing item"]
    );
  };

  const handleActionClick = async (action: string) => {
    if (isTyping) return;
    if (action === 'CANCEL_ORDER' && selectedOrder && db) {
      try {
        await updateDoc(doc(db, 'orders', selectedOrder.id), { 
          status: 'Cancelled', 
          cancelledBy: 'AI Support Hub',
          updatedAt: serverTimestamp()
        });
        toast({ title: "Order Cancelled Successfully" });
        addMessage('assistant', `Ticket #${selectedOrder.orderId} has been successfully revoked in our logs.`);
      } catch (e) {
        toast({ variant: "destructive", title: "Cancellation Protocol Failed" });
      }
    }
  };

  if (userLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col pt-16 md:pt-24 max-w-2xl mx-auto w-full px-4 pb-4 overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational Support Node</span>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setMessages([initialMessage])} className="h-8 rounded-lg font-black uppercase text-[9px] tracking-widest gap-2">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Hub
          </Button>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-6 space-y-6 flex flex-col">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex flex-col max-w-[90%]", msg.role === 'user' ? "ml-auto items-end" : "items-start")}>
                <div className={cn("p-4 px-6 rounded-[2rem] shadow-sm text-sm font-medium leading-relaxed border", 
                  msg.role === 'user' ? "bg-primary text-white border-primary rounded-tr-none" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-tl-none")}>
                  {msg.content}
                </div>

                {/* PROTOCOL ACTIONS */}
                {msg.protocolAction && msg.protocolAction !== 'NONE' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.protocolAction === 'TRACK_ORDER' && selectedOrder && (
                      <Link href={`/orders/${selectedOrder.orderId}`}>
                        <Button type="button" className="h-10 rounded-xl bg-zinc-950 text-white font-black uppercase text-[8px] tracking-widest gap-2 shadow-lg">
                          <Truck className="w-3 h-3" /> Track Order Hub
                        </Button>
                      </Link>
                    )}
                    {msg.protocolAction === 'CANCEL_ORDER' && (
                      <Button type="button" onClick={() => handleActionClick('CANCEL_ORDER')} variant="destructive" className="h-10 rounded-xl font-black uppercase text-[8px] tracking-widest gap-2 shadow-lg">
                        <Ban className="w-3 h-3" /> Execute Cancellation
                      </Button>
                    )}
                    {msg.protocolAction === 'CALL_RESTAURANT' && (
                      <Button type="button" onClick={() => window.open(`tel:${settings?.contactNumber}`)} className="h-10 rounded-xl bg-emerald-600 text-white font-black uppercase text-[8px] tracking-widest gap-2 shadow-lg">
                        <Phone className="w-3 h-3" /> Call Station Now
                      </Button>
                    )}
                  </div>
                )}

                {/* RENDER CATEGORIES */}
                {msg.type === 'options' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 w-full">
                    {[
                      { id: 'order', label: 'Order Status', icon: Package, color: 'bg-orange-50 text-orange-600' },
                      { id: 'contact', label: 'Contact Station', icon: Phone, color: 'bg-blue-50 text-blue-600' },
                      { id: 'feedback', label: 'Rate Experience', icon: Star, color: 'bg-emerald-50 text-emerald-600' }
                    ].map(cat => (
                      <button key={cat.id} type="button" onClick={() => handleCategoryClick(cat)} className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-[1.5rem] border hover:border-primary transition-all text-left shadow-sm active:scale-[0.98]">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cat.color)}><cat.icon className="w-5 h-5" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* RENDER ORDERS */}
                {msg.type === 'orders' && (
                  <div className="space-y-2 mt-3 w-full">
                    {ordersLoading ? <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto opacity-20" /></div> : 
                      (!recentOrders?.length ? <p className="text-[10px] font-black uppercase opacity-40 px-4">No active nodes in history.</p> :
                      recentOrders.map(o => (
                        <button key={o.id} type="button" onClick={() => handleOrderSelect(o)} className="w-full p-4 bg-white dark:bg-zinc-900 rounded-[1.5rem] border flex items-center justify-between hover:border-primary transition-all shadow-sm active:scale-[0.98]">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary"><Package className="w-5 h-5" /></div>
                            <div className="text-left">
                              <p className="text-[10px] font-black uppercase text-primary">#{o.orderId}</p>
                              <p className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">{o.status} • ₹{o.total}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-20" />
                        </button>
                      )))
                    }
                  </div>
                )}

                {/* RENDER CHIPS */}
                {msg.type === 'chips' && msg.options && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.options.map((opt, i) => (
                      <button key={i} type="button" onClick={() => handleSendMessage(opt)} className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-full text-[9px] font-black uppercase tracking-widest border border-zinc-200 hover:border-primary hover:text-primary transition-all shadow-sm active:scale-[0.95]">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* RENDER CONTACT */}
                {msg.type === 'contact' && (
                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border shadow-sm space-y-4 mt-3 w-full">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"><Phone className="w-5 h-5" /></div>
                      <div><p className="text-[8px] font-black uppercase opacity-40">Station Hotline</p><p className="text-sm font-black">+91 {settings?.contactNumber}</p></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Mail className="w-5 h-5" /></div>
                      <div><p className="text-[8px] font-black uppercase opacity-40">Identity Mail</p><p className="text-sm font-black">support@ezzybites.com</p></div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-4 bg-white dark:bg-zinc-900 rounded-[2rem] border w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={scrollRef} className="h-4" />
        </div>

        {/* INPUT */}
        <div className="shrink-0 pt-4 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md pb-2">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3 bg-white dark:bg-zinc-900 p-1.5 rounded-full border shadow-xl items-center ring-4 ring-primary/5">
            <Input 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              placeholder="Signal your concern..." 
              className="flex-1 border-none bg-transparent focus-visible:ring-0 font-bold px-6 h-12" 
            />
            <Button 
              type="submit" 
              disabled={!inputText.trim() || isTyping} 
              className="w-12 h-12 rounded-full p-0 bg-primary text-white shrink-0 shadow-lg active:scale-90 transition-transform"
            >
              {isTyping ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
          <p className="text-[7px] font-black text-center mt-3 uppercase tracking-[0.5em] opacity-20">Ezzy AI Cluster v5.1 • Live Logic Active</p>
        </div>
      </main>
    </div>
  );
}
