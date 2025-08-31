
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCard } from '@/components/product-card';
import { Search, ShoppingBag } from 'lucide-react';
import { useProduct } from '@/hooks/use-product';
import { CallToAction } from '@/components/call-to-action';
import { PromotionalCarousel } from '@/components/promotional-carousel';
import { FlashSales } from '@/components/flash-sales';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';

export default function HomePage() {
  const { state: productState } = useProduct();
  const { products, loading } = productState;
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isClient, setIsClient] = useState(false);

  const categories = useMemo(() => {
    return ['All', ...[...new Set(products.map((p) => p.category))].sort()];
  }, [products]);

  useEffect(() => {
    setIsClient(true);
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categories.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory('All');
    }
  }, [searchParams, categories]);


  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <>
      <CallToAction />
      {isClient && <PromotionalCarousel />}
      <FlashSales />
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-primary lg:text-5xl">Welcome to ShopWave</h1>
          <p className="mt-4 text-lg text-muted-foreground">Find everything you need, and more.</p>
        </header>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for products..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i}>
                        <Skeleton className="aspect-square w-full" />
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
            </div>
        ) : (
           <div className="text-center col-span-full py-16">
              <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground" />
              <p className="text-muted-foreground mt-4">No products found. Try adjusting your search or filters.</p>
           </div>
        )}
      </div>
    </>
  );
}
