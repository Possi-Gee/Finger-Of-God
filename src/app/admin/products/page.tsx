
'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categories, type Product } from '@/lib/products';
import { useProduct } from '@/hooks/use-product';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { sendProductUpdateEmail } from '@/app/actions/send-email';
import { useAuth } from '@/hooks/use-auth';
import { useWishlist } from '@/hooks/use-wishlist';
import { useSiteSettings } from '@/hooks/use-site-settings';

import { Button, buttonVariants } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Camera, Upload, Link as LinkIcon, AlertTriangle, Loader2, Bot, SwitchCamera, Edit, Trash2, Search, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { User } from 'firebase/auth';

const variantSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Variant name is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  originalPrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
});

const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().url('A valid image is required'),
  features: z.string().optional(),
  rating: z.coerce.number().min(0).max(5, 'Rating must be between 0 and 5').default(0),
  reviews: z.coerce.number().min(0).default(0),
  isOfficialStore: z.boolean().default(false),
  variants: z.array(variantSchema).min(1, 'At least one product variant is required.'),
});

type ProductFormValues = z.infer<typeof productSchema>;

// This function is hypothetical. In a real app, you'd fetch this from your database.
// For this prototype, we'll simulate fetching users who have a specific product in their wishlist.
const getUsersWithProductInWishlist = (productId: number, allUsers: User[], wishlistState: any): User[] => {
    // This is a simplified simulation. A real implementation would need a backend service
    // to query all users' wishlists. Here we are limited to the current user's wishlist state.
    const { isWishlisted } = wishlistState;
    // We can't check other users' wishlists, so for demonstration, we will check
    // if the current logged-in user has it in their wishlist.
    const currentUser = getAuth().currentUser;
    if (currentUser && isWishlisted(productId)) {
        return [currentUser];
    }
    return [];
}


export default function AdminProductsPage() {
  const { state: productState, dispatch: productDispatch } = useProduct();
  const { products } = productState;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();
  const { user } = useAuth(); // We need the current admin/user
  const wishlistState = useWishlist();
  const { state: siteSettings } = useSiteSettings();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');


  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isOfficialStore: false,
      rating: 0,
      reviews: 0,
      variants: [{ name: 'Standard', price: 0, stock: 0 }],
    }
  });
  
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "variants"
  });

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageTab, setImageTab] = useState('url');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isGenerating, setIsGenerating] = useState(false);

  const productName = watch('name');
  const features = watch('features');
  const variants = watch('variants');
  const singleItemVariantIndex = variants.findIndex(v => v.name === 'Single');
  const isSoldAsSingleItem = singleItemVariantIndex !== -1;

  const handleToggleSingleItemSale = (checked: boolean) => {
    if (checked) {
      // Add a 'Single' variant if it doesn't exist
      if (!isSoldAsSingleItem) {
        append({ name: 'Single', price: 0, stock: 0, originalPrice: 0 });
      }
    } else {
      // Remove the 'Single' variant if it exists
      if (isSoldAsSingleItem) {
        // Prevent removal if it's the last variant
        if (getValues('variants').length > 1) {
            remove(singleItemVariantIndex);
        } else {
            toast({
                title: "Cannot Remove",
                description: "You must have at least one variant for a product.",
                variant: 'destructive',
            })
        }
      }
    }
  };


  const handleGenerateDescription = async () => {
    if (!productName || !features) {
      toast({
        title: 'Missing Details',
        description: 'Please enter a product name and some features to generate a description.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateProductDescription({
        productName,
        features,
        numVariations: 1,
      });
      if (result.descriptions && result.descriptions.length > 0) {
        setValue('description', result.descriptions[0], { shouldValidate: true });
        toast({ title: 'Success', description: 'Generated product description.' });
      } else {
        throw new Error('No description was generated.');
      }
    } catch (error) {
       toast({
        title: 'Error',
        description: 'Failed to generate description. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, []);

  const startCamera = useCallback(async (currentFacingMode: 'user' | 'environment') => {
    stopCamera();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode } });
      setHasCameraPermission(true);
      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    if (isDialogOpen && imageTab === 'camera') {
        startCamera(facingMode);
    } else {
        stopCamera();
    }
  }, [isDialogOpen, imageTab, facingMode, startCamera, stopCamera]);


  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);


  const handleTabChange = (value: string) => {
    setImageSrc(null);
    setValue('image', '');
    setImageTab(value);
  };
  
  const handleToggleFacingMode = () => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const resetDialog = useCallback(() => {
    stopCamera();
    reset({
      isOfficialStore: false,
      rating: 0,
      reviews: 0,
      variants: [{ name: 'Standard', price: 0, stock: 0 }],
      name: '',
      description: '',
      category: '',
      image: '',
      features: '',
    });
    setImageSrc(null);
    setHasCameraPermission(null);
    setEditingProduct(null);
    setImageTab('url');
  }, [reset, stopCamera]);

  useEffect(() => {
    if (!isDialogOpen) {
      resetDialog();
    }
  }, [isDialogOpen, resetDialog]);


  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setImageSrc(dataUrl);
        setValue('image', dataUrl, { shouldValidate: true });
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setImageSrc(null);
    setValue('image', '');
    if (imageTab === 'camera') {
      startCamera(facingMode);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageSrc(dataUrl);
        setValue('image', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url) {
      setImageSrc(url);
      setValue('image', url, { shouldValidate: true });
    }
  };


  const onSubmit = async (data: ProductFormValues) => {
    const productData = {
      ...data,
      variants: data.variants.map(v => ({...v, id: v.id || Date.now() + Math.random()}))
    }

    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        ...productData,
      };
      productDispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      toast({
        title: 'Product Updated',
        description: `${data.name} has been successfully updated.`,
      });
      
      // Get users and send emails
      // In a real app, this would be a more complex query to a user database
      const usersToNotify = wishlistState.items
        .filter(item => item.id === updatedProduct.id)
        .map(() => user) // Simulate finding the user, in reality, you'd have user objects
        .filter((u): u is User => u !== null);
        
      if(user) { // For demo, we'll assume the current admin is the user to notify
        const isWishlisted = wishlistState.isWishlisted(updatedProduct.id);
        if (isWishlisted) {
            console.log(`Sending update email to ${user.email} for product ${updatedProduct.name}`);
            await sendProductUpdateEmail({
                product: updatedProduct,
                user: user,
                fromEmail: siteSettings.fromEmail,
                appName: siteSettings.appName,
                logoUrl: siteSettings.logoUrl
            });
        }
      }


    } else {
      const newProduct: Product = {
        id: Date.now(),
        ...productData,
        dataAiHint: `${data.category.toLowerCase()} product`
      };
      productDispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      toast({
        title: 'Product Added',
        description: `${data.name} has been successfully added.`,
      });
    }
    setIsDialogOpen(false);
  };
  
  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    // Ensure variants have unique IDs for the form field array
    const productWithVariantIds = {
        ...product,
        variants: product.variants.map(v => ({ ...v, id: v.id || Math.random() }))
    };
    reset(productWithVariantIds);
    setImageSrc(product.image);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      productDispatch({ type: 'DELETE_PRODUCT', payload: { id: productToDelete.id } });
      toast({
        title: 'Product Deleted',
        description: `${productToDelete.name} has been deleted.`,
        variant: 'destructive',
      });
    }
    setIsDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  const getProductPrice = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      return 'N/A';
    }
    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `GH₵${minPrice.toFixed(2)}`;
    }
    return `GH₵${minPrice.toFixed(2)} - GH₵${maxPrice.toFixed(2)}`;
  }
  
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (filterCategory !== 'All') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price));
        case 'price-desc':
          return Math.max(...b.variants.map(v => v.price)) - Math.max(...a.variants.map(v => v.price));
        default:
          return 0;
      }
    });

    return filtered;

  }, [products, searchTerm, filterCategory, sortBy]);



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Package className="h-8 w-8" />
           <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="text-muted-foreground">Manage your product inventory.</p>
           </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] p-0 max-h-[90vh]">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update the details below.' : 'Fill in the details below to add a new product.'}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="overflow-y-auto">
              <form onSubmit={handleSubmit(onSubmit)} id="product-form" className="px-6 py-4 grid gap-6">
                
                {/* Product Details Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" {...register('name')} />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Controller
                            name="category"
                            control={control}
                            render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                {categories.filter(c => c !== 'All').map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            )}
                        />
                      {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="features">Features</Label>
                     <Textarea id="features" {...register('features')} placeholder="e.g., Bluetooth 5.2, 30-hour battery" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" {...register('description')} />
                    {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating || !productName || !features} className="mt-2">
                      {isGenerating ? <><Loader2 className="mr-2 animate-spin"/> Generating...</> : <><Bot className="mr-2"/> Generate with AI</>}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="rating">Rating (0-5)</Label>
                          <Input id="rating" type="number" step="0.1" {...register('rating')} />
                          {errors.rating && <p className="text-sm text-destructive mt-1">{errors.rating.message}</p>}
                      </div>
                       <div className="space-y-2">
                          <Label htmlFor="reviews">Reviews</Label>
                          <Input id="reviews" type="number" {...register('reviews')} />
                          {errors.reviews && <p className="text-sm text-destructive mt-1">{errors.reviews.message}</p>}
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Controller
                            name="isOfficialStore"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    id="isOfficialStore"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                         <Label htmlFor="isOfficialStore">Official Store</Label>
                      </div>
                  </div>
                </div>

                {/* Image Section */}
                <div className="space-y-2">
                  <Label>Image</Label>
                  <Card className="p-4 bg-background">
                     <Tabs value={imageTab} onValueChange={handleTabChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="url"><LinkIcon className="mr-1" /> URL</TabsTrigger>
                        <TabsTrigger value="upload"><Upload className="mr-1" /> Upload</TabsTrigger>
                        <TabsTrigger value="camera"><Camera className="mr-1" /> Camera</TabsTrigger>
                      </TabsList>
                      <TabsContent value="url" className="mt-4">
                        <Input placeholder="https://example.com/image.jpg" onChange={handleUrlChange} />
                      </TabsContent>
                      <TabsContent value="upload" className="mt-4">
                         <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                      </TabsContent>
                      <TabsContent value="camera" className="mt-4 space-y-2">
                          {!imageSrc && (
                            <div className="w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                <canvas ref={canvasRef} className="hidden" />
                                {streamRef.current && (
                                   <Button type="button" variant="ghost" size="icon" onClick={handleToggleFacingMode} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white">
                                      <SwitchCamera />
                                   </Button>
                                )}
                            </div>
                          )}
                           {hasCameraPermission === false && (
                              <Alert variant="destructive">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertTitle>Camera Access Denied</AlertTitle>
                                  <AlertDescription>
                                  Please enable camera permissions in your browser settings.
                                  </AlertDescription>
                              </Alert>
                           )}
                           <div className="flex gap-2">
                           {imageSrc ? (
                              <Button type="button" onClick={handleRetake}>Retake</Button>
                           ) : (
                            hasCameraPermission && streamRef.current && <Button type="button" onClick={captureImage}>Capture</Button>
                           )}
                           </div>
                      </TabsContent>
                    </Tabs>
                     {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message}</p>}
                     {imageSrc && (
                      <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Image Preview:</p>
                          <Image src={imageSrc} alt="Preview" width={100} height={100} className="rounded-md object-cover" />
                      </div>
                      )}
                  </Card>
                </div>

                {/* Variants Section */}
                <div className="space-y-4">
                    <Separator />
                    <div>
                        <h3 className="text-lg font-medium">Product Options</h3>
                         <p className="text-sm text-muted-foreground">Define how this product can be purchased.</p>
                        {errors.variants && <p className="text-sm text-destructive mt-1">{typeof errors.variants.message === 'string' ? errors.variants.message : 'Please check variant details.'}</p>}
                    </div>
                    
                    <Card className="p-4 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="single-item-sale" className="font-medium">Sell as individual item</Label>
                        <Switch
                          id="single-item-sale"
                          checked={isSoldAsSingleItem}
                          onCheckedChange={handleToggleSingleItemSale}
                        />
                      </div>
                      {isSoldAsSingleItem && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                            <input type="hidden" {...register(`variants.${singleItemVariantIndex}.name`)} value="Single" />
                             <div>
                                <Label>Price</Label>
                                <Input type="number" {...register(`variants.${singleItemVariantIndex}.price`)} step="0.01" />
                                {errors.variants?.[singleItemVariantIndex]?.price && <p className="text-sm text-destructive mt-1">{errors.variants[singleItemVariantIndex]?.price?.message}</p>}
                            </div>
                            <div>
                                <Label>Original Price (Optional)</Label>
                                <Input type="number" {...register(`variants.${singleItemVariantIndex}.originalPrice`)} step="0.01" />
                            </div>
                            <div>
                                <Label>Stock</Label>
                                <Input type="number" {...register(`variants.${singleItemVariantIndex}.stock`)} />
                                 {errors.variants?.[singleItemVariantIndex]?.stock && <p className="text-sm text-destructive mt-1">{errors.variants[singleItemVariantIndex]?.stock?.message}</p>}
                            </div>
                        </div>
                      )}
                    </Card>

                    <div className="space-y-4">
                        <h4 className="font-medium">Add Packs or Bundles</h4>
                        {fields.map((field, index) => {
                            if (field.name === 'Single') return null;
                            return (
                            <Card key={field.id} className="p-4 bg-muted/20 relative">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="lg:col-span-4">
                                        <Label>Pack/Bundle Name</Label>
                                        <Input {...register(`variants.${index}.name`)} placeholder="e.g., Large, Red, 12-Pack" />
                                        {errors.variants?.[index]?.name && <p className="text-sm text-destructive mt-1">{errors.variants?.[index]?.name?.message}</p>}
                                    </div>
                                    <div>
                                        <Label>Price</Label>
                                        <Input type="number" {...register(`variants.${index}.price`)} step="0.01" />
                                        {errors.variants?.[index]?.price && <p className="text-sm text-destructive mt-1">{errors.variants?.[index]?.price?.message}</p>}
                                    </div>
                                    <div>
                                        <Label>Original Price (Optional)</Label>
                                        <Input type="number" {...register(`variants.${index}.originalPrice`)} step="0.01" />
                                    </div>
                                    <div>
                                        <Label>Stock</Label>
                                        <Input type="number" {...register(`variants.${index}.stock`)} />
                                        {errors.variants?.[index]?.stock && <p className="text-sm text-destructive mt-1">{errors.variants?.[index]?.stock?.message}</p>}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                                    onClick={() => remove(index)}
                                    disabled={fields.filter(f => f.name !== 'Single').length <= 0 && !isSoldAsSingleItem}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </Card>
                        )})}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ name: '', price: 0, stock: 0})}
                    >
                        <PlusCircle className="mr-2" />
                        Add Pack/Bundle
                    </Button>
                </div>
              </form>
            </ScrollArea>
            <DialogFooter className="p-6 pt-0 border-t">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" form="product-form" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

       <Card>
         <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>
                Filter, sort, and manage all your products.
            </CardDescription>
            <div className="pt-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                    type="text"
                    placeholder="Search product name..."
                    className="w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                    {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                 <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="name-asc">Name: A-Z</SelectItem>
                        <SelectItem value="name-desc">Name: Z-A</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
         </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProducts.length > 0 ? filteredAndSortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                      data-ai-hint={product.dataAiHint}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{getProductPrice(product)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => handleEditClick(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No products found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className={buttonVariants({ variant: 'destructive'})}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
