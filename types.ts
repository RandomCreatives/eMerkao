export enum Language {
  ENGLISH = 'en',
  AMHARIC = 'am',
  OROMO = 'om',
  TIGRINYA = 'ti'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  location: string;
  rating: number;
  sellerId: string;
  isCultural?: boolean;
  isTrusted?: boolean;
}

export interface Order {
  id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  items: { productId: string; quantity: number }[];
  total: number;
  date: string;
  paymentMethod: string;
}

export interface Seller {
  id: string;
  storeName: string;
  kycStatus: 'unverified' | 'pending' | 'verified';
  revenue: number;
  orders: number;
  isTrusted: boolean;
  trustScore: number;
}

export interface CrossPostSettings {
  facebookEnabled: boolean;
  instagramEnabled: boolean;
  n8nWebhookUrl: string;
}