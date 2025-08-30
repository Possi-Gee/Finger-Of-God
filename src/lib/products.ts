
export type ProductVariant = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
};


export type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  images: string[];
  rating: number;
  reviews: number;
  isOfficialStore?: boolean;
  dataAiHint: string;
  variants: ProductVariant[];
  features?: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: 'Moisturizing Body Lotion',
    description: 'A rich and creamy body lotion that provides 24-hour hydration for dry skin.',
    category: 'Toiletries & Personal Care',
    images: ['https://picsum.photos/600/600?random=1', 'https://picsum.photos/600/600?random=11', 'https://picsum.photos/600/600?random=21'],
    rating: 4.8,
    reviews: 210,
    isOfficialStore: true,
    dataAiHint: 'lotion bottle',
    variants: [
      { id: 1, name: '400ml', price: 8.99, stock: 150 },
    ]
  },
  {
    id: 2,
    name: 'Sparkling Mineral Water',
    description: 'Crisp and refreshing sparkling mineral water, sourced from natural springs.',
    category: 'Food & Beverages',
    images: ['https://picsum.photos/600/600?random=2'],
    rating: 4.9,
    reviews: 350,
    isOfficialStore: true,
    dataAiHint: 'water bottle',
     variants: [
      { id: 2, name: '1L Bottle', price: 1.99, originalPrice: 2.49, stock: 200 },
    ]
  },
  {
    id: 3,
    name: 'Antibacterial Hand Soap',
    description: 'Gentle foaming hand soap that kills 99.9% of germs without drying your skin.',
    category: 'Toiletries & Personal Care',
    images: ['https://picsum.photos/600/600?random=3'],
    rating: 4.7,
    reviews: 180,
    dataAiHint: 'soap dispenser',
    variants: [
       { id: 3, name: '250ml', price: 3.50, stock: 300 },
    ]
  },
  {
    id: 4,
    name: 'All-Purpose Cleaning Spray',
    description: 'A powerful, lemon-scented all-purpose cleaner for a sparkling, streak-free shine on all surfaces.',
    category: 'Cleaning Supplies',
    images: ['https://picsum.photos/600/600?random=4'],
    rating: 4.6,
    reviews: 155,
    isOfficialStore: true,
    dataAiHint: 'spray bottle',
    variants: [
       { id: 4, name: '750ml', price: 4.99, stock: 120 },
    ]
  },
  {
    id: 5,
    name: 'Aluminum Foil Roll',
    description: 'Heavy-duty aluminum foil, perfect for grilling, baking, and food storage. 75 sq. ft.',
    category: 'Packaging & Disposables',
    images: ['https://picsum.photos/600/600?random=5'],
    rating: 4.8,
    reviews: 250,
    dataAiHint: 'foil roll',
    variants: [
      { id: 5, name: '75 sq. ft.', price: 5.49, stock: 180 },
    ]
  },
  {
    id: 6,
    name: 'Instant Coffee Granules',
    description: 'A rich and aromatic blend of instant coffee for a quick and satisfying cup.',
    category: 'Food & Beverages',
    images: ['https://picsum.photos/600/600?random=6'],
    rating: 4.5,
    reviews: 190,
    dataAiHint: 'coffee jar',
     variants: [
       { id: 8, name: '200g Jar', price: 7.99, stock: 90 },
    ]
  },
  {
    id: 7,
    name: 'Heavy-Duty Trash Bags',
    description: 'Durable, tear-resistant trash bags with drawstring closure. 50 count.',
    category: 'Cleaning Supplies',
    images: ['https://picsum.photos/600/600?random=7'],
    rating: 4.7,
    reviews: 220,
    isOfficialStore: true,
    dataAiHint: 'trash bags',
     variants: [
      { id: 9, name: '50 Count', price: 12.99, originalPrice: 14.99, stock: 80 },
    ]
  },
  {
    id: 8,
    name: 'Disposable Paper Cups',
    description: '100-pack of 8 oz paper cups for hot and cold beverages. Ideal for parties and office use.',
    category: 'Packaging & Disposables',
    images: ['https://picsum.photos/600/600?random=8'],
    rating: 4.4,
    reviews: 130,
    dataAiHint: 'paper cups',
     variants: [
      { id: 10, name: '100 Pack', price: 6.50, stock: 250 },
    ]
  },
  {
    id: 9,
    name: 'Whitening Toothpaste',
    description: 'Fluoride toothpaste that gently whitens teeth by removing surface stains. Mint flavor.',
    category: 'Toiletries & Personal Care',
    images: ['https://picsum.photos/600/600?random=9'],
    rating: 4.6,
    reviews: 170,
    dataAiHint: 'toothpaste tube',
     variants: [
       { id: 11, name: '150g', price: 4.29, stock: 200 },
    ]
  },
  {
    id: 10,
    name: 'Oats & Honey Granola Bars',
    description: 'Wholesome granola bars made with whole grain oats and a touch of sweet honey.',
    category: 'Food & Beverages',
    images: ['https://picsum.photos/600/600?random=10'],
    rating: 4.8,
    reviews: 300,
    isOfficialStore: true,
    dataAiHint: 'granola bars',
     variants: [
      { id: 13, name: '6-Pack', price: 3.49, originalPrice: 3.99, stock: 150 },
    ]
  },
  {
    id: 11,
    name: 'Paper Towel Rolls',
    description: 'Absorbent and strong paper towels for tackling spills and messes. 2-ply, 6 rolls.',
    category: 'Cleaning Supplies',
    images: ['https://picsum.photos/600/600?random=11'],
    rating: 4.8,
    reviews: 450,
    dataAiHint: 'paper towels',
     variants: [
      { id: 14, name: '6 Rolls', price: 9.99, stock: 100 },
    ]
  },
  {
    id: 12,
    name: 'Biodegradable Food Containers',
    description: 'Eco-friendly food containers with lids made from biodegradable materials. 25 count.',
    category: 'Packaging & Disposables',
    images: ['https://picsum.photos/600/600?random=12'],
    rating: 4.7,
    reviews: 180,
    dataAiHint: 'food containers',
     variants: [
       { id: 16, name: '25 Pack', price: 15.99, stock: 80 },
    ]
  },
  {
    id: 13,
    name: "Herbal Essence Shampoo",
    description: "A gentle shampoo infused with herbal extracts to nourish and strengthen your hair.",
    category: "Toiletries & Personal Care",
    images: ["https://picsum.photos/600/600?random=13"],
    rating: 4.9,
    reviews: 500,
    isOfficialStore: true,
    dataAiHint: "shampoo bottle",
    variants: [
      { id: 17, name: "Single Bottle", price: 6.50, stock: 100 },
      { id: 18, name: "Family Pack (3 Bottles)", price: 18.00, stock: 30 },
    ],
  }
];

export const categories = [
  'All',
  ...Array.from(new Set(products.map((p) => p.category))).sort(),
];
