
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
import { OrderProvider } from '@/context/order-context';
import { AuthProvider } from '@/context/auth-context';
import { useTheme } from '@/context/theme-provider';

// export const metadata: Metadata = {
//   title: 'ShopWave',
//   description: 'A modern e-commerce experience.',
// };

function AppLayout({ children }: { children: React.ReactNode }) {
  const { state: settings } = useSiteSettings();
  const { theme } = useTheme();

   useEffect(() => {
    document.title = settings.appName;
    const root = document.documentElement;

    // We only want to apply the settings theme for the 'light' mode.
    // The 'dark' mode will be handled by the CSS variables in globals.css under the .dark selector.
    if (theme === 'light' || theme === 'system') {
       (Object.keys(settings.theme) as Array<keyof typeof settings.theme>).forEach((key) => {
        const value = settings.theme[key];
        root.style.setProperty(`--${key}`, value);
      });
    } else {
       // When switching to dark mode, remove the inline styles to let the CSS take over.
       (Object.keys(settings.theme) as Array<keyof typeof settings.theme>).forEach((key) => {
          root.style.removeProperty(`--${key}`);
       });
    }

  }, [settings, theme]);

  return (
     <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
         <AuthProvider>
            <ProductProvider>
              <WishlistProvider>
                <CartProvider>
                  <HomepageProvider>
                    <OrderProvider>
                      {children}
                      <Toaster />
                    </OrderProvider>
                  </HomepageProvider>
                </CartProvider>
              </WishlistProvider>
            </ProductProvider>
          </AuthProvider>
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
       <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
         <AppLayout>{children}</AppLayout>
      </ThemeProvider>
    </SiteSettingsProvider>
  );
}
