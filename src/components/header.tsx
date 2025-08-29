
'use client';

import Link from 'next/link';
import { Package, Sun, Moon, Wrench } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/use-site-settings';
import Image from 'next/image';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { state: settings } = useSiteSettings();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
           {settings.logoUrl ? (
            <Image src={settings.logoUrl} alt={settings.appName} width={30} height={30} className="rounded-md object-contain" />
          ) : (
            <Package className="h-6 w-6 text-primary" />
          )}
           <span className="font-bold sm:inline-block">{settings.appName}</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/dashboard" aria-label="Admin Panel">
              <Wrench className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>
    </header>
  );
}
