import type { ContactFormData, ApiResponse } from '@neurastate/shared';
import { API_ROUTES } from '@neurastate/shared';

/**
 * Client-side service for contact operations
 * Should be called from client components
 */

export async function submitContactForm(data: ContactFormData): Promise<boolean> {
  const response = await fetch(API_ROUTES.CONTACT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to submit contact form');
  }

  const result: ApiResponse<boolean> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to submit contact form');
  }

  return true;
}
