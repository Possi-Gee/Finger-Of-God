
'use client';

import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { History, Heart, User, LogOut } from 'lucide-react';
import { ProfileListItem } from '@/components/profile-list-item';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);


  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  if (loading || !user) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex flex-col items-center space-y-4 mb-8">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="text-center space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Account</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                             <div className="p-4"><Skeleton className="h-6 w-full" /></div>
                             <div className="p-4"><Skeleton className="h-6 w-full" /></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{user.displayName || 'Anonymous User'}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Account</CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
               <ProfileListItem href="/orders" icon={History} label="My Orders" />
               <ProfileListItem href="/wishlist" icon={Heart} label="My Wishlist" />
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>This information is managed by your identity provider.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="fullName">Full Name</Label>
                 <Input id="fullName" defaultValue={user.displayName || ''} disabled />
               </div>
                <div className="space-y-2">
                 <Label htmlFor="email">Email Address</Label>
                 <Input id="email" type="email" defaultValue={user.email || ''} disabled />
               </div>
            </CardContent>
          </Card>

          <Card>
             <CardContent className="p-0">
               <div onClick={handleLogout} className="cursor-pointer">
                  <ProfileListItem href="#" icon={LogOut} label="Log Out" />
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
