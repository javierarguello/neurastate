import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, IMapProperty, MapService } from '@neurastate/shared';

// Force this route to be dynamic to avoid static generation bailouts
export const dynamic = 'force-dynamic';

/**
 * Route parameters interface
 */
interface IRouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/map/properties/[id]
 *
 * Retrieves full details for a specific property by its objectId.
 * Used for on-demand loading when user clicks a property marker.
 *
 * Example: /api/map/properties/12345
 */
export async function GET(request: NextRequest, { params }: IRouteParams) {
  try {
    const objectId = parseInt(params.id, 10);

    // Validate objectId
    if (isNaN(objectId) || objectId <= 0) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid property ID',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Call service to get property details
    const mapService = new MapService();
    const property = await mapService.getPropertyDetails(objectId);

    if (!property) {
      const response: ApiResponse = {
        success: false,
        error: 'Property not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<IMapProperty> = {
      success: true,
      data: property,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching property details:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch property details',
    };

    return NextResponse.json(response, { status: 500 });
  }
}
