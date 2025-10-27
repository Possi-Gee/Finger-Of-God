
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSiteSettings, type SiteTheme, type FooterSettings } from '@/hooks/use-site-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, Palette, Text, Link as LinkIcon, Percent, Landmark, Image as ImageIcon, Home, Edit, Mail, Loader2, Users, ShieldAlert, Phone } from 'lucide-react';
import Image from 'next/image';
import { ProfileListItem } from '@/components/profile-list-item';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


// Schemas for each form section
const generalSchema = z.object({ 
  appName: z.string().min(1, 'App name is required'),
  logoUrl: z.string().url().or(z.literal('')),
  adminEmail: z.string().email('A valid email is required'),
  adminPhone: z.string().min(1, 'Phone number is required'),
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


export default function SiteSettingsPage() {
  const { state, updateSettings } = useSiteSettings();
  const { toast } = useToast();

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
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Site Settings</h1>
      </div>
      <p className="text-muted-foreground">Manage the global settings for your application.</p>
      
      <GeneralSettingsForm onSubmit={createSubmitHandler('General Settings Updated')} defaultValues={{ appName: state.appName, logoUrl: state.logoUrl, adminEmail: state.adminEmail, adminPhone: state.adminPhone }} />
      <CommerceSettingsForm onSubmit={createSubmitHandler('Commerce Settings Updated')} defaultValues={{ taxRate: state.taxRate, shippingFee: state.shippingFee }} />
      <ThemeSettingsForm onSubmit={createSubmitHandler('Theme Updated')} defaultValues={state.theme} />
      <ContentManagementCard />
      <FooterSettingsForm onSubmit={createSubmitHandler('Footer Updated')} defaultValues={state.footer} />
      <AdminManagementCard />
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
          <CardDescription>Basic application settings like name, logo, and contact information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input id="appName" {...register('appName')} />
              {errors.appName && <p className="text-sm text-destructive mt-1">{errors.appName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" {...register('logoUrl')} placeholder="https://example.com/logo.png" />
              {errors.logoUrl && <p className="text-sm text-destructive mt-1">{errors.logoUrl.message}</p>}
            </div>
          </div>
           {logoUrl && (
            <div className="mt-4 p-4 border rounded-md bg-muted/50 flex items-center justify-center">
              <Image src={logoUrl} alt="Logo Preview" width={100} height={40} style={{ objectFit: 'contain' }} />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                 <div className="relative">
                    <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="adminEmail" type="email" {...register('adminEmail')} className="pl-8" />
                </div>
                {errors.adminEmail && <p className="text-sm text-destructive mt-1">{errors.adminEmail.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPhone">Admin Phone</Label>
                 <div className="relative">
                    <Phone className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="adminPhone" type="tel" {...register('adminPhone')} className="pl-8" />
                </div>
                {errors.adminPhone && <p className="text-sm text-destructive mt-1">{errors.adminPhone.message}</p>}
              </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save General Settings
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
              Save Commerce Settings
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
              Save Theme
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
  
  const { fields, append, remove } = useFieldArray({ control, name: 'columns' });
  
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

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
              Save Footer
            </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function FieldArrayLinks({ colIndex, control, register }: { colIndex: number; control: any, register: any }) {
  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({ control, name: `columns.${colIndex}.links` });
  return (
    <div className="space-y-2 pl-4 border-l-2">
      {linkFields.map((link, linkIndex) => (
        <div key={link.id} className="flex items-center gap-2">
          <Input placeholder="Link Label" {...register(`columns.${colIndex}.links.${linkIndex}.label`)} />
          <Input placeholder="https://example.com" {...register(`columns.${colIndex}.links.${linkIndex}.url`)} />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(linkIndex)}><Trash2 className="text-destructive h-5 w-5" /></Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="secondary" onClick={() => appendLink({ id: Date.now(), label: '', url: '' })}><PlusCircle className="mr-2" /> Add Link</Button>
    </div>
  );
}


function AdminManagementCard() {
  const { user } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check current user's role
  useEffect(() => {
    if (!user) return;
    
    // Hardcoded check for the primary superadmin
    if (user.email === 'admin@jaytelclassic.com') {
        setCurrentUserRole('superadmin');
        return;
    }

    const userAdminDoc = doc(db, 'admins', user.uid);
    const unsubscribe = onSnapshot(userAdminDoc, (doc) => {
        setCurrentUserRole(doc.data()?.role || null);
    });
    return () => unsubscribe();
  }, [user]);

  // Fetch all admins if current user is superadmin
  useEffect(() => {
    if (currentUserRole !== 'superadmin') {
      setAdmins([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const adminsCol = collection(db, 'admins');
    const unsubscribe = onSnapshot(adminsCol, (snapshot) => {
      const adminList = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        // Correctly convert Firestore Timestamp to JS Date
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : null;
        return {
          id: docSnap.id,
          ...data,
          expiresAt: expiresAt,
        };
      });
      setAdmins(adminList);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch admins:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserRole]);

  const getBadgeVariant = (expiresAt: Date | null) => {
    if (!expiresAt) return 'secondary';
    const now = new Date();
    const isExpired = now > expiresAt;
    return isExpired ? 'destructive' : 'outline';
  };

  const getExpiryText = (expiresAt: Date | null) => {
    if (!expiresAt) return 'Never';
    const now = new Date();
    const isExpired = now > expiresAt;
    return `${isExpired ? 'Expired on' : 'Expires on'} ${expiresAt.toLocaleDateString()}`;
  };

  if (currentUserRole !== 'superadmin') {
    return null; // Don't render this card if user is not a superadmin
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users /> Admin Management</CardTitle>
              <CardDescription>
                View current administrators and their access status. Admins must be managed directly in Firebase.
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                    <ShieldAlert className="mr-2" />
                    How to Manage Admins
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Managing Administrator Access</AlertDialogTitle>
                  <AlertDialogDescription>
                    For security, new admins must be added directly in your Firebase Firestore database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="text-sm text-muted-foreground space-y-4">
                  <ol className="list-decimal list-inside space-y-2">
                      <li>**Get User UID:** Go to Firebase **Authentication** -&gt; **Users** tab and copy the UID of the user you want to make an admin.</li>
                      <li>**Go to Firestore:** Navigate to the **Firestore Database** section.</li>
                      <li>**Open `admins` Collection:** Click on the `admins` collection.</li>
                      <li>**Add Document:** Click **+ Add document**.</li>
                      <li>**Set Document ID:** Paste the user's UID into the **Document ID** field.</li>
                      <li>**Add Fields:**
                          <ul className="list-disc list-inside pl-4 mt-2">
                              <li>`email` (string): The user's email.</li>
                              <li>`role` (string): Set to `admin` or `superadmin`.</li>
                              <li>`expiresAt` (timestamp, optional): Set an expiration date for their access.</li>
                          </ul>
                      </li>
                      <li>**Save** the new document.</li>
                  </ol>
                  <p>To remove an admin, simply delete their document from this collection.</p>
                </div>
                <AlertDialogFooter>
                  <AlertDialogAction>Got it</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length > 0 ? admins.map((admin: any) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={admin.role === 'superadmin' ? 'default' : 'secondary'}>
                        {admin.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(admin.expiresAt)}>
                        {getExpiryText(admin.expiresAt)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No administrators found. Add one in the Firebase console.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

    