import type { ContactFormData } from '@neurastate/shared';
import { isValidEmail } from '@neurastate/shared';

/**
 * Handle contact form submissions
 */
export async function handleContactFormSubmission(data: ContactFormData): Promise<boolean> {
  // Validate email
  if (!isValidEmail(data.email)) {
    throw new Error('Invalid email address');
  }

  console.log(`Processing contact form from: ${data.email}`);

  // Mock implementation - would integrate with email service
  await sendContactNotification(data);
  await sendAutoReply(data.email);

  return true;
}

async function sendContactNotification(data: ContactFormData): Promise<void> {
  console.log('Sending notification to admin:', {
    from: data.email,
    name: data.name,
    subject: data.subject || 'New contact form submission',
  });
  // Integration with email service (SendGrid, etc.) would go here
}

async function sendAutoReply(email: string): Promise<void> {
  console.log(`Sending auto-reply to: ${email}`);
  // Send confirmation email to user
}
