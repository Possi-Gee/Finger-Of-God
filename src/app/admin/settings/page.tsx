
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Trash2, PlusCircle, Palette, Text, Link as LinkIcon, DollarSign, Percent } from 'lucide-react';

const linkSchema = z.object({
  id: z.number(),
  label: z.string().min(1, 'Label is required'),
  url: z.string().url('Must be a valid URL'),
});

const footerColumnSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Title is required'),
  links: z.array(linkSchema),
});

const settingsSchema = z.object({
  appName: z.string().min(1, 'App name is required'),
  taxRate: z.coerce.number().min(0, 'Tax rate must be a positive number'),
  shippingFee: z.coerce.number().min(0, 'Shipping fee must be a positive number'),
  theme: z.object({
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
  }),
  footer: z.object({
    columns: z.array(footerColumnSchema),
    socialLinks: z.object({
      twitter: z.string().url().optional().or(z.literal('')),
      facebook: z.string().url().optional().or(z.literal('')),
      instagram: z.string().url().optional().or(z.literal('')),
    })
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SiteSettingsPage() {
  const { state, dispatch } = useSiteSettings();
  const { toast } = useToast();

  const { control, register, handleSubmit, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: state,
  });

  const { fields: footerColumns, append: appendFooterColumn, remove: removeFooterColumn } = useFieldArray({
    control,
    name: 'footer.columns',
  });

  const onSubmit = (data: SettingsFormValues) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: data });
    toast({
      title: 'Settings Updated',
      description: 'Your site settings have been saved successfully.',
    });
  };

  return (
    <div className="space-y-6">
       <div className="text-center">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground mt-2">Manage the global settings for your application.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
        </Card>
        
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
        </Card>

        <Card>
          <CardHeader>
            <CardTitle  className="flex items-center gap-2"><Palette /> Theme Colors</CardTitle>
            <CardDescription>Customize the look and feel of your app. Enter HSL values as `H S% L%` (e.g., `222 47% 11%`) or other valid CSS colors.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.keys(state.theme) as Array<keyof typeof state.theme>).map((key) => (
              <div key={key} className="space-y-2">
                 <Label htmlFor={`theme-${key}`} className="capitalize">{key.replace('-', ' ')}</Label>
                 <Input id={`theme-${key}`} {...register(`theme.${key}`)} />
                 {errors.theme?.[key] && <p className="text-sm text-destructive mt-1">{errors.theme[key]?.message}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle  className="flex items-center gap-2"><LinkIcon /> Footer Settings</CardTitle>
            <CardDescription>Manage the content of the site footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Social Media Links</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label>Twitter URL</Label>
                        <Input {...register('footer.socialLinks.twitter')} placeholder="https://twitter.com/yourprofile" />
                    </div>
                    <div>
                        <Label>Facebook URL</Label>
                        <Input {...register('footer.socialLinks.facebook')} placeholder="https://facebook.com/yourpage"/>
                    </div>
                    <div>
                        <Label>Instagram URL</Label>
                        <Input {...register('footer.socialLinks.instagram')} placeholder="https://instagram.com/yourprofile"/>
                    </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Footer Columns</h4>
                <div className="space-y-4">
                {footerColumns.map((column, colIndex) => (
                  <Card key={column.id} className="p-4 bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <Input placeholder="Column Title" {...register(`footer.columns.${colIndex}.title`)} className="font-semibold text-lg" />
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeFooterColumn(colIndex)}>
                        <Trash2 />
                      </Button>
                    </div>
                    <FieldArrayLinks control={control} register={register} colIndex={colIndex} />
                  </Card>
                ))}
                </div>
                <Button type="button" variant="outline" className="mt-4" onClick={() => appendFooterColumn({ id: Date.now(), title: 'New Column', links: [] })}>
                  <PlusCircle className="mr-2" /> Add Footer Column
                </Button>
              </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">Save All Settings</Button>
        </div>
      </form>
    </div>
  );
}

function FieldArrayLinks({ colIndex, control, register }: { colIndex: number; control: any, register: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `footer.columns.${colIndex}.links`,
  });

  return (
    <div className="space-y-2 pl-4 border-l-2">
      {fields.map((link, linkIndex) => (
        <div key={link.id} className="flex items-center gap-2">
          <Input placeholder="Link Label" {...register(`footer.columns.${colIndex}.links.${linkIndex}.label`)} />
          <Input placeholder="https://example.com" {...register(`footer.columns.${colIndex}.links.${linkIndex}.url`)} />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(linkIndex)}>
            <Trash2 className="text-destructive h-5 w-5" />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="secondary" onClick={() => append({ id: Date.now(), label: '', url: '' })}>
         <PlusCircle className="mr-2" /> Add Link
      </Button>
    </div>
  );
}
