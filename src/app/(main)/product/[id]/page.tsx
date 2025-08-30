
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
import { Heart, ShoppingCart, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import type { ProductVariant } from '@/lib/products';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { state: productState } = useProduct();
  const { products } = productState;

  const { dispatch: cartDispatch } = useCart();
  const { state: wishlistState, dispatch: wishlistDispatch, isWishlisted } = useWishlist();
  const { toast } = useToast();

  const product = products.find(p => p.id.toString() === id);

  const [selectedImage, setSelectedImage] = useState(
    product?.images && product.images.length > 0 ? product.images[0] : undefined
  );

  const getDefaultVariant = () => {
    if (!product) return undefined;
    const singleVariant = product.variants.find(v => v.name.toLowerCase() === 'single' || v.name.toLowerCase() === 'standard' || v.name.toLowerCase() === 'single bottle');
    return singleVariant || product.variants[0];
  }

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(getDefaultVariant());
  const [quantity, setQuantity] = useState(1);

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
    if (quantity <= 0 || isNaN(quantity)) {
       toast({
            title: 'Invalid quantity',
            description: 'Please enter a quantity greater than zero.',
            variant: 'destructive',
        });
        return;
    }
    cartDispatch({ type: 'ADD_ITEM', payload: { product, variant: selectedVariant, quantity } });
    toast({
      title: 'Added to cart',
      description: `${quantity} x ${product.name} (${selectedVariant.name}) has been added to your cart.`,
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
    setQuantity(1); // Reset quantity when variant changes
  }
  
  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  }

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(isNaN(value) ? 1 : value);
  }
  
  const mainImage = selectedImage || (product.images && product.images.length > 0 ? product.images[0] : 'https://picsum.photos/600/600');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-4">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-opacity duration-300"
              data-ai-hint={product.dataAiHint}
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.images && product.images.length > 0 && product.images.map((image, index) => (
              <button 
                key={index}
                onClick={() => setSelectedImage(image)}
                className={cn(
                  "relative aspect-square w-full rounded-md overflow-hidden ring-2 ring-transparent transition-all",
                  selectedImage === image ? "ring-primary" : "hover:ring-primary/50"
                )}
              >
                <Image
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  sizes="20vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div>
            <p className="text-sm font-medium text-primary">{product.category}</p>
            <h1 className="text-3xl lg:text-4xl font-bold mt-2">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mt-4">GH₵{selectedVariant?.price.toFixed(2)}</p>
          </div>
          
          <Separator className="my-6" />

           {product.variants.length > 1 && (
            <div className="mb-6">
                <Label className="text-lg font-semibold mb-2 block">Select Option</Label>
                <RadioGroup 
                    defaultValue={selectedVariant?.id.toString()}
                    onValueChange={handleVariantChange}
                    className="grid grid-cols-2 gap-3"
                >
                    {product.variants.map(variant => (
                        <div key={variant.id}>
                            <RadioGroupItem value={variant.id.toString()} id={`v-${variant.id}`} className="sr-only peer"/>
                            <Label 
                                htmlFor={`v-${variant.id}`}
                                className="flex flex-col text-center items-center justify-between rounded-md border-2 border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <span className="font-semibold">{variant.name}</span>
                                <span className="text-sm text-muted-foreground">GH₵{variant.price.toFixed(2)}</span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
          )}

          <div className="mb-6">
            <Label htmlFor="quantity" className="text-lg font-semibold mb-2 block">Quantity</Label>
            <div className="flex items-center gap-2">
                 <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)} disabled={!selectedVariant}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Input 
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={handleQuantityInputChange}
                    className="h-10 w-20 text-center"
                    disabled={!selectedVariant}
                />
                 <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)} disabled={!selectedVariant}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
          </div>
          

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
