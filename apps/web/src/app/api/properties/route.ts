import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, Property } from '@neurastate/shared';
import { getProperties, getFeaturedProperties } from '@/services/server';

// Force this route to be dynamic to avoid static generation bailouts
export const dynamic = 'force-dynamic';

/**
 * GET /api/properties
 * Reads optional query params and returns properties.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as Property['status'] | null;
    const featured = searchParams.get('featured');

    let properties: Property[];

    if (featured === 'true') {
      properties = await getFeaturedProperties();
    } else {
      const filters: Parameters<typeof getProperties>[0] = {};
      if (status) filters.status = status;

      properties = await getProperties(filters);
    }

    const response: ApiResponse<Property[]> = {
      success: true,
      data: properties,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching properties:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch properties',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
