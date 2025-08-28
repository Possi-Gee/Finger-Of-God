
'use client';

import * as React from "react"
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel"

const promotions = [
    { id: 1, image: 'https://picsum.photos/1200/400?random=1', alt: 'Promotion 1', dataAiHint: 'sale discount' },
    { id: 2, image: 'https://picsum.photos/1200/400?random=2', alt: 'Promotion 2', dataAiHint: 'new arrivals' },
    { id: 3, image: 'https://picsum.photos/1200/400?random=3', alt: 'Promotion 3', dataAiHint: 'electronics promotion' },
    { id: 4, image: 'https://picsum.photos/1200/400?random=4', alt: 'Promotion 4', dataAiHint: 'fashion sale' },
];

export function PromotionalCarousel() {
  return (
    <div className="w-full bg-white py-4">
        <Carousel
        plugins={[Autoplay({ delay: 3000, stopOnInteraction: true })]}
        className="w-full max-w-6xl mx-auto"
        >
        <CarouselContent>
            {promotions.map((promo) => (
            <CarouselItem key={promo.id}>
                <div className="p-1">
                <Card>
                    <CardContent className="relative flex aspect-[3/1] items-center justify-center p-0 overflow-hidden rounded-lg">
                        <Image src={promo.image} alt={promo.alt} fill className="object-cover" data-ai-hint={promo.dataAiHint} />
                    </CardContent>
                </Card>
                </div>
            </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselDots />
        </Carousel>
    </div>
  )
}
