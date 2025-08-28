
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
    
    (Object.keys(settings.theme) as Array<keyof typeof settings.theme>).forEach((key) => {
      root.style.setProperty(`--${key}`, settings.theme[key]);
    });

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
