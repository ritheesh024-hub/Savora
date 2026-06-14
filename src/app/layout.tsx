'use client';

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { BrandIntro } from '@/components/BrandIntro';
import Script from 'next/script';
import React, { useEffect } from 'react';
import { useAnalytics } from '@/hooks/use-analytics';

function AnalyticsInitializer() {
  const { trackAppOpen } = useAnalytics();
  
  useEffect(() => {
    trackAppOpen();
  }, [trackAppOpen]);
  
  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <FirebaseClientProvider>
          <AnalyticsInitializer />
          <BrandIntro />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
