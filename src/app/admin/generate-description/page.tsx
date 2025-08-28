'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Clipboard, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  productName: z.string().min(3, 'Product name must be at least 3 characters long.'),
  features: z.string().min(10, 'Please provide some key features.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function GenerateDescriptionPage() {
  const [generatedDescriptions, setGeneratedDescriptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setGeneratedDescriptions([]);
    try {
      const result = await generateProductDescription({
        productName: data.productName,
        features: data.features,
        numVariations: 3,
      });
      if (result.descriptions && result.descriptions.length > 0) {
        setGeneratedDescriptions(result.descriptions);
        toast({ title: 'Success', description: 'Generated new product descriptions.' });
      } else {
        throw new Error('No descriptions were generated.');
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to generate descriptions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="text-center mb-8">
        <Bot className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold mt-4">AI Product Description Generator</h1>
        <p className="text-muted-foreground mt-2">Create compelling product descriptions in seconds.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Enter the product name and key features to generate descriptions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                placeholder="e.g., Wireless Noise-Cancelling Headphones"
                {...register('productName')}
              />
              {errors.productName && <p className="text-sm text-destructive">{errors.productName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Key Features</Label>
              <Textarea
                id="features"
                placeholder="e.g., Bluetooth 5.2, 30-hour battery, active noise cancellation, built-in microphone"
                {...register('features')}
                rows={4}
              />
              {errors.features && <p className="text-sm text-destructive">{errors.features.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Descriptions'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {generatedDescriptions.length > 0 && (
        <div className="mt-8">
            <Separator className="my-6"/>
          <h2 className="text-2xl font-bold mb-4">Generated Descriptions</h2>
          <div className="space-y-4">
            {generatedDescriptions.map((desc, index) => (
              <Card key={index}>
                <CardContent className="p-4 relative">
                  <p className="text-card-foreground pr-10">{desc}</p>
                   <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => copyToClipboard(desc)}
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
