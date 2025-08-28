
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function WishlistPage() {
  const { state: wishlistState, dispatch: wishlistDispatch } = useWishlist();
  const { dispatch: cartDispatch } = useCart();
  const { items } = wishlistState;
  const { toast } = useToast();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Heart className="mx-auto h-24 w-24 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-semibold">Your Wishlist is Empty</h1>
        <p className="mt-2 text-muted-foreground">Add your favorite items to your wishlist to see them here.</p>
        <Button asChild className="mt-6">
          <Link href="/">Discover Products</Link>
        </Button>
      </div>
    );
  }

  const handleRemoveFromWishlist = (id: number, name: string) => {
    wishlistDispatch({ type: 'REMOVE_ITEM', payload: { id } });
    toast({
      title: 'Removed from wishlist',
      description: `${name} has been removed from your wishlist.`,
      variant: 'destructive',
    });
  };

  const handleAddToCart = (product: typeof items[0]) => {
    cartDispatch({ type: 'ADD_ITEM', payload: product });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Wishlist</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(product => (
          <Card key={product.id} className="flex flex-col overflow-hidden">
            <CardHeader className="p-0">
              <div className="relative aspect-square w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  data-ai-hint={product.dataAiHint}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <p className="text-xs text-muted-foreground">{product.category}</p>
              <CardTitle className="mt-1 text-base font-semibold leading-tight">{product.name}</CardTitle>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2 p-4 pt-0">
               <p className="text-lg font-bold text-primary self-start">${product.price.toFixed(2)}</p>
               <Button onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Move to Cart
              </Button>
              <Button variant="outline" onClick={() => handleRemoveFromWishlist(product.id, product.name)}>
                <Trash2 className="mr-2 h-4 w-4" /> Remove
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
