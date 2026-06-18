'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Settings, Bell, Lock, Shield, Eye, Loader2, Moon, Sun, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/app/lib/store';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const { isDarkMode, toggleDarkMode } = useStore();

  if (userLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  const handleUpdate = () => {
    toast({ title: "Settings Saved", description: "Your preferences have been updated live." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-16 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-secondary rounded-2xl flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black font-headline uppercase tracking-tighter">Account <span className="text-primary italic">Settings</span></h1>
              <p className="text-muted-foreground text-xs font-medium">Customize your application experience.</p>
            </div>
          </div>

          <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-zinc-900">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">App Appearance</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                     {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                   </div>
                   <span className="font-bold text-xs">Dark Mode Experience</span>
                 </div>
                 <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                     <Volume2 className="w-5 h-5 text-blue-500" />
                   </div>
                   <span className="font-bold text-xs">Haptic & Audio Feedback</span>
                 </div>
                 <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-xl bg-white dark:bg-zinc-900">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-40">Privacy & Data</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center"><Bell className="w-5 h-5 text-orange-500" /></div>
                   <span className="font-bold text-xs">Push Notifications</span>
                 </div>
                 <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl opacity-50">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center"><Lock className="w-5 h-5 text-green-500" /></div>
                   <span className="font-bold text-xs">Two-Factor Authentication</span>
                 </div>
                 <Badge variant="outline" className="text-[7px] uppercase font-black">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="pt-4 flex flex-col gap-4">
             <Button onClick={handleUpdate} className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] bg-primary">Save All Preferences</Button>
             <Button variant="ghost" className="w-full text-destructive font-bold text-xs">Delete My Account Permanently</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
