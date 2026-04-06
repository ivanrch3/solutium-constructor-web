import { Product, Customer } from '../types/schema';

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'TechFlow Solutions', companyLogoUrl: 'https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg' },
  { id: 'c2', name: 'Global Logistics', companyLogoUrl: 'https://cdn.worldvectorlogo.com/logos/fedex-logo.svg' },
  { id: 'c3', name: 'Creative Agency', companyLogoUrl: 'https://cdn.worldvectorlogo.com/logos/adobe-2.svg' },
  { id: 'c4', name: 'HealthFirst Inc.', companyLogoUrl: 'https://cdn.worldvectorlogo.com/logos/spotify-1.svg' },
  { id: 'c5', name: 'Future Systems', companyLogoUrl: 'https://cdn.worldvectorlogo.com/logos/microsoft-5.svg' },
  { id: 'c6', name: 'EcoEnergy Co.', companyLogoUrl: 'https://cdn.worldvectorlogo.com/logos/tesla-9.svg' }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Cámara Profesional Alpha Z1',
    price: 1299.00,
    priceReference: 1499.00,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1000&auto=format&fit=crop',
    category: 'Fotografía',
    ratingAverage: 4.8,
    reviewCount: 124,
    badgeText: 'Nuevo'
  },
  {
    id: '2',
    name: 'Auriculares Wireless Pro G7',
    price: 249.99,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop',
    category: 'Audio',
    ratingAverage: 4.5,
    reviewCount: 89,
    badgeText: 'Oferta'
  },
  {
    id: '3',
    name: 'Smartwatch Series X Titanium',
    price: 399.00,
    priceReference: 450.00,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1544117518-30dd5ff7a986?q=80&w=1000&auto=format&fit=crop',
    category: 'Wearables',
    ratingAverage: 4.9,
    reviewCount: 215
  },
  {
    id: '4',
    name: 'Lente Prime 50mm f/1.8',
    price: 199.00,
    imageUrl: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?q=80&w=1000&auto=format&fit=crop',
    image2Url: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?q=80&w=1000&auto=format&fit=crop',
    category: 'Fotografía',
    ratingAverage: 4.7,
    reviewCount: 56
  }
];
