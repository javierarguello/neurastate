import type { Property } from '@neurastate/shared';
import { generateId } from '@neurastate/shared';

/**
 * Server-side service for property operations
 * Should only be called from API routes or server components
 */

// Mock database
const mockProperties: Property[] = [
  {
    id: generateId('prop'),
    title: 'Luxury Oceanfront Penthouse',
    address: '1000 Brickell Plaza',
    city: 'Miami',
    state: 'FL',
    zipCode: '33131',
    price: 8500000,
    bedrooms: 4,
    bathrooms: 5,
    sqft: 4200,
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    status: 'available',
    featured: true,
    description: 'Stunning oceanfront penthouse with panoramic views of Biscayne Bay',
    yearBuilt: 2022,
    propertyType: 'condo'
  },
  {
    id: generateId('prop'),
    title: 'Modern Miami Beach Villa',
    address: '456 Ocean Drive',
    city: 'Miami Beach',
    state: 'FL',
    zipCode: '33139',
    price: 12500000,
    bedrooms: 6,
    bathrooms: 7,
    sqft: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    status: 'available',
    featured: true,
    description: 'Contemporary villa with private beach access and infinity pool',
    yearBuilt: 2023,
    propertyType: 'house'
  },
  {
    id: generateId('prop'),
    title: 'Brickell Luxury Condo',
    address: '88 SW 7th Street',
    city: 'Miami',
    state: 'FL',
    zipCode: '33130',
    price: 2750000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2400,
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    status: 'available',
    featured: true,
    description: 'High-rise condo in the heart of Brickell with city views',
    yearBuilt: 2021,
    propertyType: 'condo'
  }
];

/**
 * Returns properties filtered by optional criteria.
 * Uses default bounds for price when not provided to avoid magic numbers.
 */
export async function getProperties(filters?: {
  status?: Property['status'];
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Property[]> {
  // Simulate database query
  let properties = [...mockProperties];

  if (filters) {
    if (filters.status) {
      properties = properties.filter((p) => p.status === filters.status);
    }
    if (filters.featured !== undefined) {
      properties = properties.filter((p) => p.featured === filters.featured);
    }
    // Avoid undefined access and magic numbers by using explicit defaults
    const DEFAULT_MIN_PRICE = 0;
    const DEFAULT_MAX_PRICE = Infinity;
    const minPrice = filters.minPrice ?? DEFAULT_MIN_PRICE;
    const maxPrice = filters.maxPrice ?? DEFAULT_MAX_PRICE;
    properties = properties.filter((p) => p.price >= minPrice && p.price <= maxPrice);
  }

  return properties;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const property = mockProperties.find((p) => p.id === id);
  return property || null;
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  return mockProperties.filter((p) => p.featured).slice(0, limit);
}

