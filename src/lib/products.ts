export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  dataAiHint: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: 'Wireless Headphones',
    description: 'High-fidelity sound, 20-hour battery life, and noise-cancelling technology.',
    price: 199.99,
    category: 'Electronics',
    image: 'https://picsum.photos/600/600?random=1',
    dataAiHint: 'headphones music',
  },
  {
    id: 2,
    name: 'Smart Watch',
    description: 'Track your fitness, receive notifications, and stay connected on the go.',
    price: 249.99,
    category: 'Electronics',
    image: 'https://picsum.photos/600/600?random=2',
    dataAiHint: 'smartwatch technology',
  },
  {
    id: 3,
    name: 'Leather Backpack',
    description: 'Stylish and durable backpack for daily use. Made with genuine leather.',
    price: 129.99,
    category: 'Fashion',
    image: 'https://picsum.photos/600/600?random=3',
    dataAiHint: 'backpack travel',
  },
  {
    id: 4,
    name: 'Organic Green Tea',
    description: 'A refreshing and healthy blend of organic green tea leaves. 50 bags.',
    price: 15.99,
    category: 'Groceries',
    image: 'https://picsum.photos/600/600?random=4',
    dataAiHint: 'tea drink',
  },
  {
    id: 5,
    name: 'Running Shoes',
    description: 'Lightweight and comfortable shoes for your daily runs. Available in multiple sizes.',
    price: 89.99,
    category: 'Fashion',
    image: 'https://picsum.photos/600/600?random=5',
    dataAiHint: 'shoes sport',
  },
  {
    id: 6,
    name: 'Modern Coffee Table',
    description: 'A sleek and minimalist coffee table to complement your living room.',
    price: 299.99,
    category: 'Home Goods',
    image: 'https://picsum.photos/600/600?random=6',
    dataAiHint: 'furniture interior',
  },
  {
    id: 7,
    name: 'Yoga Mat',
    description: 'Eco-friendly and non-slip yoga mat for your daily practice.',
    price: 39.99,
    category: 'Sports',
    image: 'https://picsum.photos/600/600?random=7',
    dataAiHint: 'yoga fitness',
  },
  {
    id: 8,
    name: 'Portable Blender',
    description: 'Blend your favorite smoothies and shakes anywhere, anytime.',
    price: 49.99,
    category: 'Home Goods',
    image: 'https://picsum.photos/600/600?random=8',
    dataAiHint: 'kitchen appliance',
  },
  {
    id: 9,
    name: 'Denim Jacket',
    description: 'A timeless classic. This denim jacket is a must-have for any wardrobe.',
    price: 79.99,
    category: 'Fashion',
    image: 'https://picsum.photos/600/600?random=9',
    dataAiHint: 'jacket clothing',
  },
  {
    id: 10,
    name: 'Smart Home Hub',
    description: 'Control all your smart devices from one central hub with voice commands.',
    price: 149.99,
    category: 'Electronics',
    image: 'https://picsum.photos/600/600?random=10',
    dataAiHint: 'smarthome technology',
  },
  {
    id: 11,
    name: 'Cookbook',
    description: 'Over 100 recipes for healthy and delicious meals. Perfect for all skill levels.',
    price: 24.99,
    category: 'Books',
    image: 'https://picsum.photos/600/600?random=11',
    dataAiHint: 'book food',
  },
  {
    id: 12,
    name: 'Desk Chair',
    description: 'Ergonomic office chair with lumbar support for maximum comfort.',
    price: 229.99,
    category: 'Home Goods',
    image: 'https://picsum.photos/600/600?random=12',
    dataAiHint: 'office furniture',
  },
];

export const categories = [
  'All',
  ...Array.from(new Set(products.map((p) => p.category))),
];
