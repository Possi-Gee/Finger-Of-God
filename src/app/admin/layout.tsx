
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
import { Bot, Package, Home, LayoutDashboard, Settings, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminBottomNavbar } from '@/components/admin-bottom-navbar';

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

  return (
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
                        isActive={pathname === item.href}
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
  );
}
