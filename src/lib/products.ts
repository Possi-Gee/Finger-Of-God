
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
    name: 'Wireless Headphones',
    description: 'High-fidelity sound, 20-hour battery life, and noise-cancelling technology.',
    category: 'Electronics',
    image: 'https://picsum.photos/600/600?random=1',
    rating: 4.5,
    reviews: 89,
    isOfficialStore: true,
    dataAiHint: 'headphones music',
    variants: [
      { id: 1, name: 'Standard', price: 179.99, originalPrice: 199.99, stock: 50 },
    ]
  },
  {
    id: 2,
    name: 'Smart Watch',
    description: 'Track your fitness, receive notifications, and stay connected on the go.',
    category: 'Electronics',
    image: 'https://picsum.photos/600/600?random=2',
    rating: 4.8,
    reviews: 124,
    isOfficialStore: true,
    dataAiHint: 'smartwatch technology',
    variants: [
      { id: 2, name: 'Standard', price: 249.99, stock: 30 },
    ]
  },
  {
    id: 3,
    name: 'Leather Backpack',
    description: 'Stylish and durable backpack for daily use. Made with genuine leather.',
    category: 'Fashion',
    image: 'https://picsum.photos/600/600?random=3',
    rating: 4.2,
    reviews: 54,
    dataAiHint: 'backpack travel',
    variants: [
       { id: 3, name: 'Standard', price: 129.99, stock: 25 },
    ]
  },
  {
    id: 4,
    name: 'Organic Green Tea',
    description: 'A refreshing and healthy blend of organic green tea leaves. 50 bags.',
    category: 'Groceries',
    image: 'https://picsum.photos/600/600?random=4',
    rating: 4.9,
    reviews: 210,
    isOfficialStore: true,
    dataAiHint: 'tea drink',
    variants: [
       { id: 4, name: 'Standard', price: 15.99, stock: 100 },
    ]
  },
  {
    id: 5,
    name: 'Running Shoes',
    description: 'Lightweight and comfortable shoes for your daily runs. Available in multiple sizes.',
    category: 'Fashion',
    image: 'https://picsum.photos/600/600?random=5',
    rating: 4.6,
    reviews: 150,
    dataAiHint: 'shoes sport',
    variants: [
      { id: 5, name: 'Size 9', price: 79.99, originalPrice: 89.99, stock: 40 },
      { id: 6, name: 'Size 10', price: 79.99, originalPrice: 89.99, stock: 35 },
      { id: 7, name: 'Size 11', price: 79.99, originalPrice: 89.99, stock: 30 },
    ]
  },
  {
    id: 6,
    name: 'Modern Coffee Table',
    description: 'A sleek and minimalist coffee table to complement your living room.',
    category: 'Home Goods',
    image: 'https://picsum.photos/600/600?random=6',
    rating: 4.0,
    reviews: 30,
    dataAiHint: 'furniture interior',
     variants: [
       { id: 8, name: 'Standard', price: 299.99, stock: 15 },
    ]
  },
  {
    id: 7,
    name: 'Yoga Mat',
    description: 'Eco-friendly and non-slip yoga mat for your daily practice.',
    category: 'Sports',
    image: 'https://picsum.photos/600/600?random=7',
    rating: 4.7,
    reviews: 98,
    isOfficialStore: true,
    dataAiHint: 'yoga fitness',
     variants: [
      { id: 9, name: 'Standard', price: 34.99, originalPrice: 39.99, stock: 60 },
    ]
  },
  {
    id: 8,
    name: 'Portable Blender',
    description: 'Blend your favorite smoothies and shakes anywhere, anytime.',
    category: 'Home Goods',
    image: 'https://picsum.photos/600/600?random=8',
    rating: 4.3,
    reviews: 75,
    dataAiHint: 'kitchen appliance',
     variants: [
      { id: 10, name: 'Standard', price: 49.99, stock: 45 },
    ]
  },
  {
    id: 9,
    name: 'Denim Jacket',
    description: 'A timeless classic. This denim jacket is a must-have for any wardrobe.',
    category: 'Fashion',
    image: 'https://picsum.photos/600/600?random=9',
    rating: 4.5,
    reviews: 110,
    dataAiHint: 'jacket clothing',
     variants: [
       { id: 11, name: 'Medium', price: 79.99, stock: 20 },
       { id: 12, name: 'Large', price: 79.99, stock: 20 },
    ]
  },
  {
    id: 10,
    name: 'Smart Home Hub',
    description: 'Control all your smart devices from one central hub with voice commands.',
    category: 'Electronics',
    image: 'https://picsum.photos/600/600?random=10',
    rating: 4.6,
    reviews: 130,
    isOfficialStore: true,
    dataAiHint: 'smarthome technology',
     variants: [
      { id: 13, name: 'Standard', price: 129.99, originalPrice: 149.99, stock: 25 },
    ]
  },
  {
    id: 11,
    name: 'Cookbook',
    description: 'Over 100 recipes for healthy and delicious meals. Perfect for all skill levels.',
    category: 'Books',
    image: 'https://picsum.photos/600/600?random=11',
    rating: 4.9,
    reviews: 300,
    dataAiHint: 'book food',
     variants: [
      { id: 14, name: 'Hardcover', price: 24.99, stock: 100 },
      { id: 15, name: 'Paperback', price: 19.99, stock: 150 },
    ]
  },
  {
    id: 12,
    name: 'Desk Chair',
    description: 'Ergonomic office chair with lumbar support for maximum comfort.',
    category: 'Home Goods',
    image: 'https://picsum.photos/600/600?random=12',
    rating: 4.4,
    reviews: 85,
    dataAiHint: 'office furniture',
     variants: [
       { id: 16, name: 'Standard', price: 229.99, stock: 20 },
    ]
  },
  {
    id: 13,
    name: "Mineral Water 500ml",
    description: "Pure, refreshing mineral water, bottled at the source.",
    category: "Groceries",
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
  ...Array.from(new Set(products.map((p) => p.category))),
];
