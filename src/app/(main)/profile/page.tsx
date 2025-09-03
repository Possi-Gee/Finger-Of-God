
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { History, Heart, User, LogOut, KeyRound, Loader2 } from 'lucide-react';
import { ProfileListItem } from '@/components/profile-list-item';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, loading, logout, updateUserProfile, updateUserPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const isEmailProvider = user?.providerData.some(p => p.providerId === 'password');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
    if (user) {
      profileForm.reset({ displayName: user.displayName || '' });
    }
  }, [user, loading, router, profileForm]);

  const handleProfileUpdate = async (data: ProfileFormValues) => {
    try {
      await updateUserProfile(data.displayName);
      toast({
        title: 'Profile Updated',
        description: 'Your display name has been changed.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePasswordChange = async (data: PasswordFormValues) => {
    try {
      await updateUserPassword(data.newPassword);
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      });
      passwordForm.reset();
    } catch (error: any) {
       toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

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
              <CardDescription>Update your display name and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEmailProvider} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={user.email || ''} disabled />
                  </div>
                   {!isEmailProvider && (
                    <Alert variant="default">
                        <AlertDescription>
                            Your name and email are managed by your social login provider.
                        </AlertDescription>
                    </Alert>
                    )}
                  {isEmailProvider && (
                      <div className="flex justify-end">
                          <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                              {profileForm.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                              Save Changes
                          </Button>
                      </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

           {isEmailProvider && (
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account's password. It's recommended to use a strong, unique password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                                    {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            )}


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
