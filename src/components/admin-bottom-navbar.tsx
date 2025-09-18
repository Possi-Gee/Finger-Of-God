
'use client';

import Link from 'next/link';
import { Home, Package, Settings, ShoppingCart, LayoutDashboard, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SUPER_ADMIN_EMAIL = "temahfingerofgod@gmail.com";

const baseNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/products', label: 'Products', icon: Package },
];

const superAdminNavItem = { href: '/admin/admins', label: 'Admins', icon: Users };
const settingsNavItem = { href: '/admin/settings', label: 'Settings', icon: Settings };
const shopNavItem = { href: '/', label: 'Shop', icon: Home };


export function AdminBottomNavbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
        if (user && user.email === SUPER_ADMIN_EMAIL) {
            setIsSuperAdmin(true);
            return;
        }

        if (user) {
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminDoc = await getDoc(adminDocRef);
            if (adminDoc.exists() && adminDoc.data().role === 'superadmin') {
                setIsSuperAdmin(true);
            } else {
                setIsSuperAdmin(false);
            }
        }
    };

    if (!loading) {
        checkAdminRole();
    }
  }, [user, loading]);
  
  const navItems = isSuperAdmin 
    ? [...baseNavItems, superAdminNavItem, shopNavItem]
    : [...baseNavItems, settingsNavItem, shopNavItem];


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container grid h-16 grid-cols-5 max-w-screen-2xl items-center justify-around">
        {navItems.map((item) => {
           const isActive = (item.href === '/admin/dashboard' && pathname === item.href) || (item.href !== '/admin/dashboard' && item.href !== '/' && pathname.startsWith(item.href));

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
