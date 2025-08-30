
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Bot, Package, Home, LayoutDashboard, Settings, ShoppingCart, Loader2, ShieldX } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminBottomNavbar } from '@/components/admin-bottom-navbar';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- Admin Configuration ---
// Add the email addresses of authorized admins to this array.
const ADMIN_EMAILS = [
  "admin@example.com",
];
// -------------------------

function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // If not logged in, redirect to login page
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // This will be shown briefly before the redirect effect kicks in
    return null; 
  }
  
  const isAuthorized = ADMIN_EMAILS.includes(user.email || '');

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <ShieldX className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page.
            <Link href="/" className="font-bold underline ml-2">Go to Homepage</Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
     {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
     {
      href: '/admin/orders',
      label: 'Orders',
      icon: ShoppingCart,
    },
    {
      href: '/admin/products',
      label: 'Products',
      icon: Package,
    },
     {
      href: '/admin/homepage-editor',
      label: 'Homepage',
      icon: Home,
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
    },
     {
      href: '/',
      label: 'Back to Shop',
      icon: Home,
    },
  ];

  const getIsActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href;
    }
    if(href === '/'){
        return false;
    }
    return pathname.startsWith(href);
  }

  return (
    <AdminAuthGuard>
      <SidebarProvider>
        <div className="md:hidden">
          <AdminBottomNavbar />
        </div>
        <div className="hidden md:block">
          <Sidebar>
              <SidebarContent>
              <SidebarGroup>
                  <SidebarMenu>
                  {menuItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                          asChild
                          isActive={getIsActive(item.href)}
                          tooltip={{ children: item.label }}
                      >
                          <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                          </Link>
                      </SidebarMenuButton>
                      </SidebarMenuItem>
                  ))}
                  </SidebarMenu>
              </SidebarGroup>
              </SidebarContent>
          </Sidebar>
        </div>
        <SidebarInset>
          <header className="p-4 flex items-center gap-2 border-b md:hidden">
              <h1 className="text-lg font-semibold">Admin Panel</h1>
          </header>
          <div className="p-4 md:p-6 pb-20 md:pb-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AdminAuthGuard>
  );
}
