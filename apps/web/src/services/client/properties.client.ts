import type { Property, ApiResponse } from '@neurastate/shared';
import { API_ROUTES } from '@neurastate/shared';

/**
 * Client-side service for property operations
 * Should be called from client components
 */

export async function fetchProperties(filters?: {
  status?: Property['status'];
  featured?: boolean;
}): Promise<Property[]> {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.featured !== undefined) {
    params.append('featured', String(filters.featured));
  }

  const url = `${API_ROUTES.PROPERTIES}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }

  const data: ApiResponse<Property[]> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch properties');
  }

  return data.data;
}

export async function fetchPropertyById(id: string): Promise<Property> {
  const response = await fetch(`${API_ROUTES.PROPERTIES}/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch property');
  }

  const data: ApiResponse<Property> = await response.json();

  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch property');
  }

  return data.data;
}

export async function fetchFeaturedProperties(): Promise<Property[]> {
  return fetchProperties({ featured: true });
}
