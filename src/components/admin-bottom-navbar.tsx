
'use client';

import Link from 'next/link';
import { Home, Package, Settings, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/homepage-editor', label: 'Homepage', icon: Home },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminBottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-around">
        {navItems.map((item) => {
           const isActive = pathname.startsWith(item.href);

           return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary',
                isActive ? 'text-primary' : ''
              )}
            >
              <div className="relative">
                <item.icon className="h-6 w-6" />
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  );
}
