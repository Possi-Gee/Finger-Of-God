
'use client';

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

function AppThemeController({ children }: { children: React.ReactNode }) {
  const { state: settings } = useSiteSettings();
  const { theme } = useTheme();

  useEffect(() => {
    document.title = settings.appName;
    const root = document.documentElement;

    if (theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
       (Object.keys(settings.theme) as Array<keyof typeof settings.theme>).forEach((key) => {
        const value = settings.theme[key];
        root.style.setProperty(`--${key}`, value);
      });
    } else {
       (Object.keys(settings.theme) as Array<keyof typeof settings.theme>).forEach((key) => {
          root.style.removeProperty(`--${key}`);
       });
    }
  }, [settings, theme]);
  
  return <>{children}</>;
}


function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
       <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AppThemeController>
          <AuthProvider>
              <ProductProvider>
                <WishlistProvider>
                  <CartProvider>
                    <OrderProvider>
                       <HomepageProvider>
                        {children}
                        <Toaster />
                      </HomepageProvider>
                    </OrderProvider>
                  </CartProvider>
                </WishlistProvider>
              </ProductProvider>
            </AuthProvider>
        </AppThemeController>
       </ThemeProvider>
    </SiteSettingsProvider>
  )
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
