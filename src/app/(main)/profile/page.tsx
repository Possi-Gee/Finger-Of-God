
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { History, Heart, User, LogOut } from 'lucide-react';
import { ProfileListItem } from '@/components/profile-list-item';

export default function ProfilePage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center space-y-4 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://picsum.photos/200" alt="User Name" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-2xl font-bold">Jane Doe</h1>
            <p className="text-muted-foreground">jane.doe@example.com</p>
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
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="fullName">Full Name</Label>
                 <Input id="fullName" defaultValue="Jane Doe" />
               </div>
                <div className="space-y-2">
                 <Label htmlFor="email">Email Address</Label>
                 <Input id="email" type="email" defaultValue="jane.doe@example.com" />
               </div>
               <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
              <ProfileListItem href="/login" icon={LogOut} label="Log Out" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
