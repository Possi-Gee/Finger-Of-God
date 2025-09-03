
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestProducts, type SuggestProductsOutput } from '@/ai/flows/personal-shopper-flow';
import { useProduct } from '@/hooks/use-product';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';

const shopperSchema = z.object({
  query: z.string().min(10, 'Please describe what you are looking for in a bit more detail.'),
});
type ShopperFormValues = z.infer<typeof shopperSchema>;

export default function PersonalShopperPage() {
  const [recommendation, setRecommendation] = useState<SuggestProductsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { state: productState } = useProduct();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ShopperFormValues>({
    resolver: zodResolver(shopperSchema),
  });

  const onSubmit: SubmitHandler<ShopperFormValues> = async ({ query }) => {
    setError(null);
    setRecommendation(null);
    try {
      const result = await suggestProducts({ query });
      setRecommendation(result);
    } catch (e: any) {
      console.error('Failed to get recommendations:', e);
      setError('Sorry, I had trouble finding recommendations. Please try again.');
    }
  };

  const recommendedProducts = recommendation?.products.map(recProduct => 
    productState.products.find(p => p.id === recProduct.id)
  ).filter(p => p !== undefined);


  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-yellow-500" />
          <CardTitle className="text-3xl font-bold mt-4">AI Personal Shopper</CardTitle>
          <CardDescription className="text-lg">
            Describe what you're looking for, and I'll find the perfect products for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input 
              {...register('query')} 
              placeholder="e.g., 'I need a gentle soap for sensitive skin'"
              className="h-12 text-base"
            />
            {errors.query && <p className="text-sm text-destructive">{errors.query.message}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Finding products...
                </>
              ) : (
                'Get Recommendations'
              )}
            </Button>
          </form>

          {error && <p className="mt-4 text-center text-destructive">{error}</p>}
          
          {recommendation && (
            <div className="mt-8 space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-center text-lg">{recommendation.recommendationText}</p>
                </div>
              
              {recommendedProducts && recommendedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {productState.loading ? (
                     [...Array(recommendedProducts.length)].map((_, i) => (
                        <Card key={i}>
                            <Skeleton className="aspect-square w-full" />
                            <CardContent className="p-4 space-y-2">
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))
                  ) : (
                    recommendedProducts.map(product => (
                      product && <ProductCard key={product.id} product={product} />
                    ))
                  )}
                </div>
              ) : (
                 <p className="text-center text-muted-foreground mt-4">I couldn't find any products that matched your request. Please try a different search.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
