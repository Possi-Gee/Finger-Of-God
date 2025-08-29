
'use client';

import Link from 'next/link';
import { Package, Sun, Moon, Wrench, User, LogIn, LogOut } from 'lucide-react';
import { useTheme } from '@/context/theme-provider';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/use-site-settings';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { state: settings } = useSiteSettings();
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

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

           {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                     <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                     <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2"/>Profile</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2"/>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           ) : (
             <Button asChild variant="ghost" size="sm">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4"/>
                Login
              </Link>
            </Button>
           )}

        </div>
      </div>
    </header>
  );
}
