
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
  image: string;
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
    name: 'Fresh Avocados',
    description: 'Creamy and delicious Hass avocados, perfect for toast or guacamole. Sold per piece.',
    category: 'Fresh Produce',
    image: 'https://picsum.photos/600/600?random=1',
    rating: 4.8,
    reviews: 152,
    isOfficialStore: true,
    dataAiHint: 'avocado fruit',
    variants: [
      { id: 1, name: 'Standard', price: 1.99, stock: 200 },
    ]
  },
  {
    id: 2,
    name: 'Organic Milk',
    description: 'One gallon of fresh, organic whole milk. Rich in calcium and vitamin D.',
    category: 'Dairy & Eggs',
    image: 'https://picsum.photos/600/600?random=2',
    rating: 4.9,
    reviews: 210,
    isOfficialStore: true,
    dataAiHint: 'milk carton',
    variants: [
      { id: 2, name: 'Gallon', price: 5.49, originalPrice: 5.99, stock: 80 },
    ]
  },
  {
    id: 3,
    name: 'Sourdough Bread',
    description: 'Artisanal sourdough loaf with a crispy crust and chewy interior. Baked fresh daily.',
    category: 'Bakery',
    image: 'https://picsum.photos/600/600?random=3',
    rating: 4.7,
    reviews: 98,
    dataAiHint: 'bread loaf',
    variants: [
       { id: 3, name: 'Standard', price: 4.50, stock: 50 },
    ]
  },
  {
    id: 4,
    name: 'Organic Green Tea',
    description: 'A refreshing and healthy blend of organic green tea leaves. 50 bags.',
    category: 'Beverages',
    image: 'https://picsum.photos/600/600?random=4',
    rating: 4.9,
    reviews: 210,
    isOfficialStore: true,
    dataAiHint: 'tea drink',
    variants: [
       { id: 4, name: '50 Bags', price: 15.99, stock: 100 },
    ]
  },
  {
    id: 5,
    name: 'Free-Range Eggs',
    description: 'One dozen large, brown, free-range eggs. Farm fresh and full of flavor.',
    category: 'Dairy & Eggs',
    image: 'https://picsum.photos/600/600?random=5',
    rating: 4.8,
    reviews: 180,
    dataAiHint: 'eggs carton',
    variants: [
      { id: 5, name: 'Dozen', price: 4.99, stock: 120 },
    ]
  },
  {
    id: 6,
    name: 'All-Purpose Cleaner',
    description: 'A powerful and versatile all-purpose cleaner for a sparkling home.',
    category: 'Household',
    image: 'https://picsum.photos/600/600?random=6',
    rating: 4.5,
    reviews: 110,
    dataAiHint: 'cleaning product',
     variants: [
       { id: 8, name: 'Standard', price: 3.99, stock: 90 },
    ]
  },
  {
    id: 7,
    name: 'Natural Spring Water',
    description: 'Crisp and refreshing natural spring water. Case of 24 bottles.',
    category: 'Beverages',
    image: 'https://picsum.photos/600/600?random=7',
    rating: 4.9,
    reviews: 350,
    isOfficialStore: true,
    dataAiHint: 'water bottles',
     variants: [
      { id: 9, name: '24-Pack', price: 8.99, originalPrice: 10.99, stock: 60 },
    ]
  },
  {
    id: 8,
    name: 'Potato Chips',
    description: 'Classic salted potato chips, the perfect crunchy snack.',
    category: 'Snacks',
    image: 'https://picsum.photos/600/600?random=8',
    rating: 4.3,
    reviews: 75,
    dataAiHint: 'chips snack',
     variants: [
      { id: 10, name: 'Family Size', price: 3.50, stock: 150 },
    ]
  },
  {
    id: 9,
    name: 'Ground Beef',
    description: '1 lb of 85% lean ground beef. Ideal for burgers, tacos, and meatballs.',
    category: 'Meat & Seafood',
    image: 'https://picsum.photos/600/600?random=9',
    rating: 4.6,
    reviews: 130,
    dataAiHint: 'meat package',
     variants: [
       { id: 11, name: '1 lb', price: 6.99, stock: 70 },
    ]
  },
  {
    id: 10,
    name: 'Tomato Sauce',
    description: 'Classic tomato sauce made from ripe, juicy tomatoes. Perfect for pasta.',
    category: 'Pantry',
    image: 'https://picsum.photos/600/600?random=10',
    rating: 4.7,
    reviews: 190,
    isOfficialStore: true,
    dataAiHint: 'sauce jar',
     variants: [
      { id: 13, name: '24 oz Jar', price: 2.49, originalPrice: 2.99, stock: 200 },
    ]
  },
  {
    id: 11,
    name: 'Bananas',
    description: 'A bunch of fresh, sweet bananas, rich in potassium. Priced per pound.',
    category: 'Fresh Produce',
    image: 'https://picsum.photos/600/600?random=11',
    rating: 4.8,
    reviews: 450,
    dataAiHint: 'bananas fruit',
     variants: [
      { id: 14, name: 'Per Lb', price: 0.59, stock: 300 },
    ]
  },
  {
    id: 12,
    name: 'Dish Soap',
    description: 'Tough on grease, gentle on hands. Leaves your dishes sparkling clean.',
    category: 'Household',
    image: 'https://picsum.photos/600/600?random=12',
    rating: 4.7,
    reviews: 180,
    dataAiHint: 'soap bottle',
     variants: [
       { id: 16, name: 'Standard', price: 2.99, stock: 150 },
    ]
  },
  {
    id: 13,
    name: "Mineral Water 500ml",
    description: "Pure, refreshing mineral water, bottled at the source.",
    category: "Beverages",
    image: "https://picsum.photos/600/600?random=13",
    rating: 4.9,
    reviews: 500,
    isOfficialStore: true,
    dataAiHint: "water bottle",
    variants: [
      { id: 17, name: "Single Bottle", price: 0.50, stock: 1000 },
      { id: 18, name: "Quarter Pack (25 bottles)", price: 10.00, stock: 40 },
      { id: 19, name: "Half Pack (50 bottles)", price: 18.00, stock: 20 },
      { id: 20, name: "Full Pack (100 bottles)", price: 32.00, stock: 10 },
    ],
  }
];

export const categories = [
  'All',
  ...Array.from(new Set(products.map((p) => p.category))).sort(),
];
