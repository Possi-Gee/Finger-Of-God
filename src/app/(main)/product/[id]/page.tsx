
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useProduct } from '@/hooks/use-product';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import type { ProductVariant } from '@/lib/products';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { state: productState } = useProduct();
  const { products } = productState;

  const { dispatch: cartDispatch } = useCart();
  const { state: wishlistState, dispatch: wishlistDispatch, isWishlisted } = useWishlist();
  const { toast } = useToast();

  const product = products.find(p => p.id.toString() === id);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product?.variants[0]);

  const relatedProducts = product
    ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-muted-foreground mt-2">The product you are looking for does not exist.</p>
         <Button asChild className="mt-6">
          <Link href="/">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (!selectedVariant) {
        toast({
            title: 'Please select an option',
            description: 'You must select a variant before adding to cart.',
            variant: 'destructive',
        });
        return;
    }
    cartDispatch({ type: 'ADD_ITEM', payload: { product, variant: selectedVariant } });
    toast({
      title: 'Added to cart',
      description: `${product.name} (${selectedVariant.name}) has been added to your cart.`,
    });
  };

  const handleToggleWishlist = () => {
    if (wishlisted) {
      wishlistDispatch({ type: 'REMOVE_ITEM', payload: { id: product.id } });
      toast({
        title: 'Removed from wishlist',
        description: `${product.name} has been removed from your wishlist.`,
        variant: 'destructive',
      });
    } else {
      wishlistDispatch({ type: 'ADD_ITEM', payload: product });
      toast({
        title: 'Added to wishlist',
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };

  const handleVariantChange = (variantId: string) => {
    const newVariant = product.variants.find(v => v.id.toString() === variantId);
    setSelectedVariant(newVariant);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            data-ai-hint={product.dataAiHint}
          />
        </div>

        <div className="flex flex-col">
          <div>
            <p className="text-sm font-medium text-primary">{product.category}</p>
            <h1 className="text-3xl lg:text-4xl font-bold mt-2">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mt-4">${selectedVariant?.price.toFixed(2)}</p>
          </div>
          
          <Separator className="my-6" />

           {product.variants.length > 1 && (
            <div className="mb-6">
                <Label className="text-lg font-semibold mb-2 block">Select Option</Label>
                <RadioGroup 
                    defaultValue={selectedVariant?.id.toString()}
                    onValueChange={handleVariantChange}
                    className="flex flex-wrap gap-3"
                >
                    {product.variants.map(variant => (
                        <div key={variant.id}>
                            <RadioGroupItem value={variant.id.toString()} id={`v-${variant.id}`} className="sr-only peer"/>
                            <Label 
                                htmlFor={`v-${variant.id}`}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <span className="font-semibold">{variant.name}</span>
                                <span className="text-sm text-muted-foreground">${variant.price.toFixed(2)}</span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
          )}
          

          <div>
             <h2 className="text-xl font-semibold">Description</h2>
             <p className="mt-4 text-muted-foreground">{product.description}</p>
          </div>
         
          <div className="mt-auto pt-6">
             <div className="flex items-center gap-4">
                <Button size="lg" className="flex-grow" onClick={handleAddToCart} disabled={!selectedVariant}>
                    <ShoppingCart className="mr-2" /> Add to Cart
                </Button>
                <Button variant="outline" size="icon" className="w-12 h-12" onClick={handleToggleWishlist}>
                    <Heart className={cn('h-6 w-6', wishlisted ? 'text-red-500 fill-current' : 'text-foreground')} />
                </Button>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <Separator />
          <h2 className="text-2xl font-bold mt-8 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
