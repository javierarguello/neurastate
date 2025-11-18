import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, ContactFormData } from '@neurastate/shared';
import { submitContactForm } from '@/services/server';

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    await submitContactForm(body);

    const response: ApiResponse<boolean> = {
      success: true,
      data: true,
      message: 'Contact form submitted successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error submitting contact form:', error);

    const message = error instanceof Error ? error.message : 'Failed to submit contact form';

    const response: ApiResponse = {
      success: false,
      error: message,
    };

    return NextResponse.json(response, { status: 400 });
  }
}
