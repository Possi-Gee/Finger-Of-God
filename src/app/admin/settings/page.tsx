
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSiteSettings, type SiteTheme, type FooterSettings } from '@/hooks/use-site-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, Palette, Text, Link as LinkIcon, Percent, Landmark, Image as ImageIcon, Home, Edit, Mail, Loader2, Users, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ProfileListItem } from '@/components/profile-list-item';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { collection, onSnapshot, doc, deleteDoc, type Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


// Schemas for each form section
const generalSchema = z.object({ 
  appName: z.string().min(1, 'App name is required'),
  logoUrl: z.string().url().or(z.literal('')),
  fromEmail: z.string().email('A valid email is required'),
});
const commerceSchema = z.object({
  taxRate: z.coerce.number().min(0, 'Tax rate must be a positive number'),
  shippingFee: z.coerce.number().min(0, 'Shipping fee must be a positive number'),
});
const themeSchema = z.object({
  background: z.string().min(1),
  foreground: z.string().min(1),
  primary: z.string().min(1),
  'primary-foreground': z.string().min(1),
  accent: z.string().min(1),
  'accent-foreground': z.string().min(1),
  card: z.string().min(1),
  'card-foreground': z.string().min(1),
  popover: z.string().min(1),
  'popover-foreground': z.string().min(1),
  border: z.string().min(1),
  input: z.string().min(1),
  ring: z.string().min(1),
});
const footerSchema = z.object({
  columns: z.array(z.object({
    id: z.number(),
    title: z.string().min(1, 'Title is required'),
    links: z.array(z.object({
      id: z.number(),
      label: z.string().min(1, 'Label is required'),
      url: z.string().url('Must be a valid URL'),
    })),
  })),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
  })
});

// For Admin Management
type AdminUser = {
  id: string; // This will be the UID from Firebase Auth
  email: string;
  role: 'admin' | 'superadmin';
  expiresAt?: Date;
};

const addAdminSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  expiresAt: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Please select a valid expiration date." }),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;
const SUPER_ADMIN_EMAIL = "temahfingerofgod@gmail.com";


export default function SiteSettingsPage() {
  const { state, updateSettings } = useSiteSettings();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  const createSubmitHandler = (toastTitle: string) => async (data: any) => {
    try {
        await updateSettings(data);
        toast({
            title: toastTitle,
            description: 'Your settings have been saved.',
        });
    } catch (error) {
         toast({
            title: 'Update Failed',
            description: 'Could not save settings to the database.',
            variant: 'destructive',
        });
        console.error("Failed to update settings:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground mt-2">Manage the global settings for your application.</p>
      </div>
      
      <GeneralSettingsForm onSubmit={createSubmitHandler('General Settings Updated')} defaultValues={{ appName: state.appName, logoUrl: state.logoUrl, fromEmail: state.fromEmail }} />
      <CommerceSettingsForm onSubmit={createSubmitHandler('Commerce Settings Updated')} defaultValues={{ taxRate: state.taxRate, shippingFee: state.shippingFee }} />
      {isSuperAdmin && <AdminManagementCard />}
      <ThemeSettingsForm onSubmit={createSubmitHandler('Theme Updated')} defaultValues={state.theme} />
      <ContentManagementCard />
      <FooterSettingsForm onSubmit={createSubmitHandler('Footer Updated')} defaultValues={state.footer} />

    </div>
  );
}

// Sub-components for each form
function GeneralSettingsForm({ onSubmit, defaultValues }: { onSubmit: (data: z.infer<typeof generalSchema>) => Promise<void>; defaultValues: z.infer<typeof generalSchema> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm({ resolver: zodResolver(generalSchema), defaultValues });
  
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);
  
  const logoUrl = watch('logoUrl');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Text /> General</CardTitle>
          <CardDescription>Basic application settings like name, logo, and sending email address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">App Name</Label>
            <Input id="appName" {...register('appName')} />
            {errors.appName && <p className="text-sm text-destructive mt-1">{errors.appName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" {...register('logoUrl')} placeholder="https://example.com/logo.png" />
            {errors.logoUrl && <p className="text-sm text-destructive mt-1">{errors.logoUrl.message}</p>}
             {logoUrl && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50 flex items-center justify-center">
                <Image src={logoUrl} alt="Logo Preview" width={100} height={40} style={{ objectFit: 'contain' }} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromEmail">"From" Email Address</Label>
            <Input id="fromEmail" {...register('fromEmail')} />
            {errors.fromEmail && <p className="text-sm text-destructive mt-1">{errors.fromEmail.message}</p>}
             <Alert className="mt-2">
                <Mail className="h-4 w-4" />
                <AlertTitle>Important: Sending Email</AlertTitle>
                <AlertDescription>
                  For testing, you can use `onboarding@resend.dev` to send emails **to your own verified email address only**. To send emails to your customers, you must use an email from a custom domain that you have verified in your Resend account.
                </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function CommerceSettingsForm({ onSubmit, defaultValues }: { onSubmit: (data: z.infer<typeof commerceSchema>) => Promise<void>; defaultValues: z.infer<typeof commerceSchema> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(commerceSchema), defaultValues });
  
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Landmark /> Commerce Settings</CardTitle>
          <CardDescription>Manage tax rates and shipping fees.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <div className="relative">
                    <Input id="taxRate" type="number" {...register('taxRate')} className="pl-8" />
                    <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.taxRate && <p className="text-sm text-destructive mt-1">{errors.taxRate.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="shippingFee">Shipping Fee</Label>
                 <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                    <span className="text-muted-foreground">GH₵</span>
                    <input {...register('shippingFee')} className="w-full bg-transparent p-0 pl-2 outline-none placeholder:text-muted-foreground"/>
                </div>
                {errors.shippingFee && <p className="text-sm text-destructive mt-1">{errors.shippingFee.message}</p>}
            </div>
        </CardContent>
        <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function ThemeSettingsForm({ onSubmit, defaultValues }: { onSubmit: (data: z.infer<typeof themeSchema>) => Promise<void>; defaultValues: SiteTheme }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(themeSchema), defaultValues });
  
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette /> Theme Colors</CardTitle>
          <CardDescription>Customize the look and feel of your app. Enter HSL values as `H S% L%` (e.g., `222 47% 11%`).</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.keys(defaultValues) as Array<keyof SiteTheme>).map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`theme-${key}`} className="capitalize">{key.replace(/-/g, ' ')}</Label>
              <Input id={`theme-${key}`} {...register(key)} />
              {errors[key] && <p className="text-sm text-destructive mt-1">{errors[key]?.message}</p>}
            </div>
          ))}
        </CardContent>
        <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function ContentManagementCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Edit /> Content Management</CardTitle>
                <CardDescription>Manage the static content and layouts of your site.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y p-0">
                <ProfileListItem href="/admin/homepage-editor" icon={Home} label="Homepage Editor" />
            </CardContent>
        </Card>
    );
}

function FooterSettingsForm({ onSubmit, defaultValues }: { onSubmit: (data: z.infer<typeof footerSchema>) => Promise<void>; defaultValues: FooterSettings }) {
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({ resolver: zodResolver(footerSchema), defaultValues });
  
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);
  
  const { fields, append, remove } = useFieldArray({ control, name: 'columns' });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LinkIcon /> Footer Settings</CardTitle>
          <CardDescription>Manage the content of the site footer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Social Media Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Twitter URL</Label><Input {...register('socialLinks.twitter')} placeholder="https://twitter.com/yourprofile" /></div>
              <div><Label>Facebook URL</Label><Input {...register('socialLinks.facebook')} placeholder="https://facebook.com/yourpage" /></div>
              <div><Label>Instagram URL</Label><Input {...register('socialLinks.instagram')} placeholder="https://instagram.com/yourprofile" /></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Footer Columns</h4>
            <div className="space-y-4">
              {fields.map((column, colIndex) => (
                <Card key={column.id} className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <Input placeholder="Column Title" {...register(`columns.${colIndex}.title`)} className="font-semibold text-lg" />
                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(colIndex)}><Trash2 /></Button>
                  </div>
                  <FieldArrayLinks control={control} register={register} colIndex={colIndex} />
                </Card>
              ))}
            </div>
            <Button type="button" variant="outline" className="mt-4" onClick={() => append({ id: Date.now(), title: 'New Column', links: [] })}>
              <PlusCircle className="mr-2" /> Add Footer Column
            </Button>
          </div>
        </CardContent>
        <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function FieldArrayLinks({ colIndex, control, register }: { colIndex: number; control: any, register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: `columns.${colIndex}.links` });
  return (
    <div className="space-y-2 pl-4 border-l-2">
      {fields.map((link, linkIndex) => (
        <div key={link.id} className="flex items-center gap-2">
          <Input placeholder="Link Label" {...register(`columns.${colIndex}.links.${linkIndex}.label`)} />
          <Input placeholder="https://example.com" {...register(`columns.${colIndex}.links.${linkIndex}.url`)} />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(linkIndex)}><Trash2 className="text-destructive h-5 w-5" /></Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="secondary" onClick={() => append({ id: Date.now(), label: '', url: '' })}><PlusCircle className="mr-2" /> Add Link</Button>
    </div>
  );
}


function AdminManagementCard() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const { toast } = useToast();
  const functions = getFunctions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
  });

  useEffect(() => {
    setLoading(true);
    const adminsColRef = collection(db, 'admins');
    const unsubscribe = onSnapshot(adminsColRef, (snapshot) => {
      const adminsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        const expiresAtTimestamp = data.expiresAt as Timestamp | undefined;
        return {
          id: doc.id,
          email: data.email,
          role: data.role,
          expiresAt: expiresAtTimestamp ? expiresAtTimestamp.toDate() : undefined,
        } as AdminUser;
      });
      setAdmins(adminsData);
      setLoading(false);
    }, (error) => {
        console.error("Failed to fetch admins:", error);
        setLoading(false);
        toast({
            title: 'Error',
            description: 'Could not fetch the list of admins.',
            variant: 'destructive'
        });
    });

    return () => unsubscribe();
  }, [toast]);

  const onSubmit = async (data: AddAdminFormValues) => {
    const createAdminUser = httpsCallable(functions, 'createAdminUser');
    try {
      const result = await createAdminUser({
        email: data.email,
        password: data.password,
        expiresAt: new Date(data.expiresAt).toISOString(),
      });

      if ((result.data as any).success) {
        toast({
          title: 'Admin Created',
          description: `User ${data.email} has been granted admin access.`,
        });
        setIsDialogOpen(false);
        reset();
      } else {
        throw new Error((result.data as any).message || 'An unknown error occurred.');
      }
    } catch (error: any) {
      console.error('Failed to create admin user:', error);
      toast({
        title: 'Creation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (admin: AdminUser) => {
    setAdminToDelete(admin);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!adminToDelete) return;
    try {
      await deleteDoc(doc(db, 'admins', adminToDelete.id));
      toast({
        title: 'Admin Removed',
        description: `Access for ${adminToDelete.email} has been revoked.`,
        variant: 'destructive',
      });
    } catch (error) {
        console.error("Failed to remove admin:", error);
        toast({ title: 'Error', description: 'Could not remove admin.', variant: 'destructive'});
    }
    setIsDeleteConfirmOpen(false);
    setAdminToDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Users /> Admin Management</CardTitle>
          <CardDescription>Create and manage temporary admin users.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              New Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Temporary Admin</DialogTitle>
              <DialogDescription>
                This will create a new user with temporary admin access. They can log in with the email and password you provide.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} id="add-admin-form" className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
               <div>
                <Label htmlFor="expiresAt">Expiration Date</Label>
                <Input id="expiresAt" type="datetime-local" {...register('expiresAt')} />
                {errors.expiresAt && <p className="text-sm text-destructive mt-1">{errors.expiresAt.message}</p>}
              </div>
            </form>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" form="add-admin-form" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                Create Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
         {loading ? (
           <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
         ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Expires On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.email}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                   <TableCell>
                    {admin.expiresAt ? format(admin.expiresAt, "PPP p") : 'Never'}
                   </TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={admin.role === 'superadmin'}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteClick(admin)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Revoke Access</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
         )}
         {admins.length === 0 && !loading && (
          <div className="text-center p-8 text-muted-foreground">No temporary admins found.</div>
         )}
      </CardContent>
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will revoke admin access for "{adminToDelete?.email}". They will no longer be able to access the dashboard. This does not delete their login account.
            </Aler tDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Revoke Access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
