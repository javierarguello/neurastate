import { NextRequest, NextResponse } from 'next/server';
import {
  ApiResponse,
  IMapProperty,
  IBoundingBox,
  IMapPropertyFilters,
  MapService,
} from '@neurastate/shared';

// Force this route to be dynamic to avoid static generation bailouts
export const dynamic = 'force-dynamic';

/**
 * GET /api/map/properties
 *
 * Retrieves properties within a geographic bounding box for map display.
 *
 * Query parameters:
 *   - bbox: Comma-separated bounding box "minLng,minLat,maxLng,maxLat"
 *   - zoom: Optional map zoom level
 *   - limit: Optional maximum number of results (default 1000, max 5000)
 *
 * Example: /api/map/properties?bbox=-80.3,25.7,-80.1,25.9&zoom=12&limit=500
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate bounding box
    const bbox = _parseBoundingBox(searchParams.get('bbox'));
    if (!bbox) {
      const response: ApiResponse = {
        success: false,
        error:
          'Invalid or missing bbox parameter. Expected format: minLng,minLat,maxLng,maxLat',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Parse optional parameters
    const zoom = _parseNumberParam(searchParams.get('zoom'));
    const limit = _parseNumberParam(searchParams.get('limit'));

    // Build filters
    const filters: IMapPropertyFilters = {
      bbox,
      zoom,
      limit,
    };

    // Call service (all business logic is in the service)
    const mapService = new MapService();
    const properties = await mapService.getPropertiesInBounds(filters);

    const response: ApiResponse<IMapProperty[]> = {
      success: true,
      data: properties,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching map properties:', error);

    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch map properties',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * Parses a bounding box string into an IBoundingBox object.
 *
 * @param bboxString - Comma-separated string "minLng,minLat,maxLng,maxLat"
 * @returns Parsed bounding box or null if invalid
 */
function _parseBoundingBox(bboxString: string | null): IBoundingBox | null {
  if (!bboxString) {
    return null;
  }

  const parts = bboxString.split(',').map((s) => parseFloat(s.trim()));

  if (parts.length !== 4 || parts.some((n) => isNaN(n))) {
    return null;
  }

  const [minLng, minLat, maxLng, maxLat] = parts;

  // Basic validation: min should be less than max
  if (minLng >= maxLng || minLat >= maxLat) {
    return null;
  }

  return { minLng, minLat, maxLng, maxLat };
}

/**
 * Parses a numeric query parameter.
 *
 * @param value - String value from query parameter
 * @returns Parsed number or undefined if invalid
 */
function _parseNumberParam(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}
