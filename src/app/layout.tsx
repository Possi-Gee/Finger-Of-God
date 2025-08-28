
'use client';

import type { Metadata } from 'next';
import { ThemeProvider } from '@/context/theme-provider';
import { CartProvider } from '@/context/cart-context';
import { WishlistProvider } from '@/context/wishlist-context';
import { ProductProvider } from '@/context/product-context';
import { HomepageProvider } from '@/context/homepage-context';
import { SiteSettingsProvider } from '@/context/site-settings-context';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { useEffect } from 'react';

// export const metadata: Metadata = {
//   title: 'ShopWave',
//   description: 'A modern e-commerce experience.',
// };

function AppLayout({ children }: { children: React.ReactNode }) {
  const { state: settings } = useSiteSettings();

   useEffect(() => {
    document.title = settings.appName;
    const root = document.documentElement;
    
    // Light mode colors
    root.style.setProperty('--theme-background', `${settings.theme.background.h} ${settings.theme.background.s}% ${settings.theme.background.l}%`);
    root.style.setProperty('--theme-foreground', `${settings.theme.foreground.h} ${settings.theme.foreground.s}% ${settings.theme.foreground.l}%`);
    root.style.setProperty('--theme-card', `${settings.theme.card.h} ${settings.theme.card.s}% ${settings.theme.card.l}%`);
    root.style.setProperty('--theme-primary', `${settings.theme.primary.h} ${settings.theme.primary.s}% ${settings.theme.primary.l}%`);
    root.style.setProperty('--theme-primary-foreground', `${settings.theme['primary-foreground'].h} ${settings.theme['primary-foreground'].s}% ${settings.theme['primary-foreground'].l}%`);
    root.style.setProperty('--theme-accent', `${settings.theme.accent.h} ${settings.theme.accent.s}% ${settings.theme.accent.l}%`);
    root.style.setProperty('--theme-accent-foreground', `${settings.theme['accent-foreground'].h} ${settings.theme['accent-foreground'].s}% ${settings.theme['accent-foreground'].l}%`);

  }, [settings]);

  return (
     <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProductProvider>
            <WishlistProvider>
              <CartProvider>
                <HomepageProvider>
                  {children}
                  <Toaster />
                </HomepageProvider>
              </CartProvider>
            </WishlistProvider>
          </ProductProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SiteSettingsProvider>
      <AppLayout>{children}</AppLayout>
    </SiteSettingsProvider>
  );
}
