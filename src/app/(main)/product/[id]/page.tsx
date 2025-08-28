
'use client';

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

export default function ProductDetailPage() {
  const params = useParams();
  const { id } = params;
  const { state: productState } = useProduct();
  const { products } = productState;

  const { dispatch: cartDispatch } = useCart();
  const { state: wishlistState, dispatch: wishlistDispatch, isWishlisted } = useWishlist();
  const { toast } = useToast();

  const product = products.find(p => p.id.toString() === id);

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
    cartDispatch({ type: 'ADD_ITEM', payload: product });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
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
            <p className="text-3xl font-bold text-primary mt-4">${product.price.toFixed(2)}</p>
          </div>
          
          <Separator className="my-6" />

          <div>
             <h2 className="text-xl font-semibold">Description</h2>
             <p className="mt-4 text-muted-foreground">{product.description}</p>
          </div>
         
          <div className="mt-auto pt-6">
             <div className="flex items-center gap-4">
                <Button size="lg" className="flex-grow" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2" /> Add to Cart
                </Button>
                <Button variant="outline" size="icon" className="w-12 h-12" onClick={handleToggleWishlist}>
                    <Heart className={cn('h-6 w-6', wishlisted ? 'text-red-500 fill-current' : 'text-foreground')} />
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
