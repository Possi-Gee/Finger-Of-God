
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
import { Trash2, PlusCircle, Palette, Text, Link as LinkIcon, DollarSign, Percent } from 'lucide-react';

// Schemas for each form section
const appNameSchema = z.object({ appName: z.string().min(1, 'App name is required') });
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
  const { state, dispatch } = useSiteSettings();
  const { toast } = useToast();

  const createSubmitHandler = (
      actionType: 'UPDATE_APP_NAME' | 'UPDATE_COMMERCE' | 'UPDATE_THEME' | 'UPDATE_FOOTER',
      toastTitle: string
    ) => (data: any) => {
    dispatch({ type: actionType, payload: data as any });
    toast({
      title: toastTitle,
      description: 'Your settings have been saved.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground mt-2">Manage the global settings for your application.</p>
      </div>
      
      <GeneralSettingsForm onSubmit={createSubmitHandler('UPDATE_APP_NAME', 'App Name Updated')} defaultValues={{ appName: state.appName }} />
      <CommerceSettingsForm onSubmit={createSubmitHandler('UPDATE_COMMERCE', 'Commerce Settings Updated')} defaultValues={{ taxRate: state.taxRate, shippingFee: state.shippingFee }} />
      <ThemeSettingsForm onSubmit={createSubmitHandler('UPDATE_THEME', 'Theme Updated')} defaultValues={state.theme} />
      <FooterSettingsForm onSubmit={createSubmitHandler('UPDATE_FOOTER', 'Footer Updated')} defaultValues={state.footer} />

    </div>
  );
}

// Sub-components for each form
function GeneralSettingsForm({ onSubmit, defaultValues }: { onSubmit: (data: z.infer<typeof appNameSchema>) => void; defaultValues: z.infer<typeof appNameSchema> }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(appNameSchema), defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Text /> General</CardTitle>
          <CardDescription>Basic application settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="appName">App Name</Label>
          <Input id="appName" {...register('appName')} />
          {errors.appName && <p className="text-sm text-destructive mt-1">{errors.appName.message}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function CommerceSettingsForm({ onSubmit, defaultValues }: { onSubmit: (data: z.infer<typeof commerceSchema>) => void; defaultValues: z.infer<typeof commerceSchema> }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(commerceSchema), defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign /> Commerce Settings</CardTitle>
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
                <Label htmlFor="shippingFee">Shipping Fee ($)</Label>
                 <div className="relative">
                    <Input id="shippingFee" type="number" {...register('shippingFee')} className="pl-8" />
                    <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 </div>
                {errors.shippingFee && <p className="text-sm text-destructive mt-1">{errors.shippingFee.message}</p>}
            </div>
        </CardContent>
        <CardFooter>
            <Button type="submit">Save Changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function ThemeSettingsForm({ onSubmit, defaultValues }: { onSubmit: (data: z.infer<typeof themeSchema>) => void; defaultValues: SiteTheme }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(themeSchema), defaultValues });
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
            <Button type="submit">Save Changes</Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function FooterSettingsForm({ onSubmit, defaultValues }: { onSubmit: (data: z.infer<typeof footerSchema>) => void; defaultValues: FooterSettings }) {
  const { control, register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(footerSchema), defaultValues });
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
            <Button type="submit">Save Changes</Button>
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
