import { Product, Language } from './types';

export const CULTURAL_CATEGORIES = [
  'Habesha Clothes',
  'Ceremonial Wear',
  'Spices (Berbere)',
  'Coffee Sets (Jebena)',
  'Religious Goods'
];

export const REGIONS = ['Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'Sidama', 'SNNPR'];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Handwoven Habesha Kemis',
    price: 4500,
    category: 'Habesha Clothes',
    image: 'https://picsum.photos/seed/kemis/600/600',
    description: 'Authentic handwoven traditional dress with modern gold embroidery.',
    location: 'Addis Ababa',
    rating: 4.8,
    sellerId: 's1',
    isCultural: true,
    isTrusted: true
  },
  {
    id: '2',
    name: 'Pure Berbere Spice (500g)',
    price: 350,
    category: 'Spices (Berbere)',
    image: 'https://picsum.photos/seed/berbere/600/600',
    description: 'Organic, stone-ground Ethiopian chili spice blend.',
    location: 'Amhara',
    rating: 4.9,
    sellerId: 's2',
    isCultural: true,
    isTrusted: true
  },
  {
    id: '3',
    name: 'Black Coffee Clay Pot (Jebena)',
    price: 850,
    category: 'Coffee Sets (Jebena)',
    image: 'https://picsum.photos/seed/jebena/600/600',
    description: 'Traditional handmade clay pot for authentic coffee ceremonies.',
    location: 'Sidama',
    rating: 4.7,
    sellerId: 's3',
    isCultural: true,
    isTrusted: true
  },
  {
    id: '4',
    name: 'Tecno Spark 10 Pro',
    price: 18500,
    category: 'Electronics',
    image: 'https://picsum.photos/seed/tecno/600/600',
    description: 'High performance smartphone with localized language support.',
    location: 'Addis Ababa',
    rating: 4.5,
    sellerId: 's1',
    isTrusted: false
  }
];

export const TRANSLATIONS = {
  [Language.ENGLISH]: {
    welcome: 'Welcome to eMerkato',
    shopByCategory: 'Shop by Category',
    culturalSection: 'Habesha Cultural Collections',
    searchPlaceholder: 'Search for products, brands...',
    telebirrPay: 'Pay with Telebirr',
    sellerDashboard: 'Seller Dashboard',
    cart: 'Shopping Cart',
    addis: 'Addis Ababa'
  },
  [Language.AMHARIC]: {
    welcome: 'ወደ እምርካቶ እንኳን ደህና መጡ',
    shopByCategory: 'በምድብ ይገበዩ',
    culturalSection: 'የሐበሻ የባህል አልባሳት እና ቁሶች',
    searchPlaceholder: 'ምርቶችን ይፈልጉ...',
    telebirrPay: 'በቴሌብር ይክፈሉ',
    sellerDashboard: 'የሻጭ ዳሽቦርድ',
    cart: 'የግዢ ጋሪ',
    addis: 'አዲስ አበባ'
  }
};