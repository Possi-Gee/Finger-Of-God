
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { products as initialProducts, categories, type Product } from '@/lib/products';
import { generateProductDescription } from '@/ai/flows/generate-product-description';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Camera, Upload, Link as LinkIcon, AlertTriangle, Loader2, Bot, SwitchCamera } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  description: z.string().min(10, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().url('A valid image is required'),
  features: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageTab, setImageTab] = useState('url');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isGenerating, setIsGenerating] = useState(false);

  const productName = watch('name');
  const features = watch('features');

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
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if(videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const startCamera = useCallback(async (currentFacingMode: 'user' | 'environment') => {
      stopCamera();
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: currentFacingMode } });
        setHasCameraPermission(true);
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    }, [stopCamera]);


  useEffect(() => {
    if (open && imageTab === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    
    return () => {
        stopCamera();
    }
  }, [open, imageTab, facingMode, startCamera, stopCamera]);


  const handleTabChange = (value: string) => {
    setImageSrc(null);
    setValue('image', '');
    setImageTab(value);
  };
  
  const handleToggleFacingMode = () => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }

  useEffect(() => {
    if (!open) {
      stopCamera();
      reset();
      setImageSrc(null);
    }
  }, [open, reset, stopCamera]);


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


  const onSubmit = (data: ProductFormValues) => {
    const newProduct: Product = {
      id: products.length + 1,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      dataAiHint: `${data.category.toLowerCase()} product`
    };
    setProducts([...products, newProduct]);
    toast({
      title: 'Product Added',
      description: `${data.name} has been successfully added.`,
    });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Products</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new product to your store.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <div className="col-span-3">
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                 <Label htmlFor="features" className="text-right pt-2">Features</Label>
                 <div className="col-span-3">
                    <Textarea id="features" {...register('features')} placeholder="e.g., Bluetooth 5.2, 30-hour battery" />
                 </div>
              </div>

               <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Description</Label>
                <div className="col-span-3">
                  <Textarea id="description" {...register('description')} />
                  {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                  <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating || !productName || !features} className="mt-2">
                    {isGenerating ? <><Loader2 className="mr-2 animate-spin"/> Generating...</> : <><Bot className="mr-2"/> Generate with AI</>}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <div className="col-span-3">
                  <Input id="price" type="number" step="0.01" {...register('price')} />
                  {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <div className="col-span-3">
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
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Image</Label>
                <div className="col-span-3">
                  <Tabs value={imageTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="url"><LinkIcon className="mr-1" /> URL</TabsTrigger>
                      <TabsTrigger value="upload"><Upload className="mr-1" /> Upload</TabsTrigger>
                      <TabsTrigger value="camera"><Camera className="mr-1" /> Camera</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-2">
                      <Input placeholder="https://example.com/image.jpg" onChange={handleUrlChange} />
                    </TabsContent>
                    <TabsContent value="upload" className="mt-2">
                       <Input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                    </TabsContent>
                    <TabsContent value="camera" className="mt-2 space-y-2">
                        <div className="w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                            {stream && (
                               <Button type="button" variant="ghost" size="icon" onClick={handleToggleFacingMode} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white">
                                  <SwitchCamera />
                               </Button>
                            )}
                        </div>
                         {hasCameraPermission === false && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Camera Access Denied</AlertTitle>
                                <AlertDescription>
                                Please enable camera permissions in your browser settings.
                                </AlertDescription>
                            </Alert>
                         )}
                         {hasCameraPermission && !stream && imageSrc && (
                            <Button type="button" onClick={() => startCamera(facingMode)}>Retake</Button>
                         )}
                        <Button type="button" onClick={captureImage} disabled={!stream}>Capture</Button>
                    </TabsContent>
                  </Tabs>
                   {errors.image && <p className="text-sm text-destructive mt-1">{errors.image.message}</p>}
                   {imageSrc && (
                    <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Image Preview:</p>
                        <Image src={imageSrc} alt="Preview" width={100} height={100} className="rounded-md object-cover" />
                    </div>
                    )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                Add Product
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
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
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    {/* Action buttons can be added here */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
