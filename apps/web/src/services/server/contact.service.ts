import type { ContactFormData } from '@neurastate/shared';
import { isValidEmail } from '@neurastate/shared';

/**
 * Server-side service for contact operations
 * Should only be called from API routes
 */

export async function submitContactForm(data: ContactFormData): Promise<boolean> {
  // Validate data
  if (!isValidEmail(data.email)) {
    throw new Error('Invalid email address');
  }

  if (!data.name || data.name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters');
  }

  if (!data.message || data.message.trim().length < 10) {
    throw new Error('Message must be at least 10 characters');
  }

  // In a real implementation, this would:
  // 1. Save to database
  // 2. Send email notifications
  // 3. Integrate with CRM
  console.log('Contact form submission:', data);

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 500));

  return true;
}
