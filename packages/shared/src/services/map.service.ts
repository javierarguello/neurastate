import { PrismaClient } from '@prisma/client';
import { createPrismaClient } from '../utils/prisma.factory';
import type { IMapProperty, IMapPropertyLight, IMapPropertyFilters } from '../types';

/**
 * Maximum number of properties to return in a single map query.
 * Prevents overwhelming the client with too many markers.
 */
const MAX_PROPERTIES_LIMIT = 5000;

/**
 * Default number of properties to return if no limit is specified.
 */
const DEFAULT_PROPERTIES_LIMIT = 1000;

/**
 * Minimum zoom level required to load properties.
 * Prevents loading too much data when map is zoomed out.
 * Higher values require more zoom (closer view) before loading data.
 */
const MINIMUM_ZOOM_LEVEL = 16;

/**
 * Service responsible for querying property data optimized for map display.
 * Uses spatial indexing (PostGIS) for efficient bounding box queries.
 */
export class MapService {
  private readonly _prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this._prisma = prismaClient ?? createPrismaClient();
  }

  /**
   * Retrieves lightweight property data (coordinates only) within a geographic bounding box.
   *
   * Uses PostGIS spatial operators with the GiST index on the `geom` column
   * for optimal performance. Only returns objectId and coordinates for fast initial load.
   * Full property details should be fetched on-demand using getPropertyDetails().
   *
   * @param filters - Filter parameters including bounding box, limit, and optional offset
   * @returns Array of lightweight property objects containing only coordinates
   * @throws Error if zoom level is below minimum threshold
   */
  public async getPropertiesInBounds(filters: IMapPropertyFilters): Promise<IMapPropertyLight[]> {
    const { bbox, limit, zoom, offset = 0 } = filters;

    // Validate minimum zoom level
    if (zoom !== undefined && zoom < MINIMUM_ZOOM_LEVEL) {
      throw new Error(
        `Zoom level ${zoom} is below minimum required level ${MINIMUM_ZOOM_LEVEL}`
      );
    }

    // Apply limit with bounds checking
    const effectiveLimit = this._calculateEffectiveLimit(limit);

    // Use raw SQL with PostGIS for spatial query - only select coordinates
    // ST_MakeEnvelope creates a bbox, && operator uses the GiST index
    // Filter for root properties only (condo_flag = false or null)
    const properties = await this._prisma.$queryRaw<IMapPropertyLight[]>`
      SELECT
        objectid as "objectId",
        ST_X(geom::geometry) as lng,
        ST_Y(geom::geometry) as lat
      FROM neurastate.property_point_view
      WHERE
        geom IS NOT NULL
        AND (condo_flag IS NULL OR condo_flag = 'false' OR condo_flag = '0')
        AND geom && ST_MakeEnvelope(
          ${bbox.minLng}::double precision,
          ${bbox.minLat}::double precision,
          ${bbox.maxLng}::double precision,
          ${bbox.maxLat}::double precision,
          4326
        )
      ORDER BY objectid
      LIMIT ${effectiveLimit}
      OFFSET ${offset}
    `;

    return properties;
  }

  /**
   * Retrieves full details for a specific property by its objectId.
   *
   * Used for on-demand loading when user clicks a property marker.
   *
   * @param objectId - Unique property identifier
   * @returns Full property details or null if not found
   */
  public async getPropertyDetails(objectId: number): Promise<IMapProperty | null> {
    const properties = await this._prisma.$queryRaw<IMapProperty[]>`
      SELECT
        objectid as "objectId",
        ST_X(geom::geometry) as lng,
        ST_Y(geom::geometry) as lat,
        true_site_addr as address,
        true_site_city as city,
        true_site_zip_code as "zipCode",
        true_owner1 as owner,
        assessed_val_cur as "assessedValue",
        price_1 as "lastSalePrice",
        bedroom_count as bedrooms,
        bathroom_count as bathrooms,
        building_actual_area as "buildingArea",
        year_built as "yearBuilt",
        dor_desc as "propertyType"
      FROM neurastate.property_point_view
      WHERE objectid = ${objectId}
      LIMIT 1
    `;

    return properties.length > 0 ? properties[0] : null;
  }

  /**
   * Calculates the effective limit for property queries.
   * Ensures the limit is within acceptable bounds.
   *
   * @param requestedLimit - Limit requested by the caller
   * @returns Safe limit value to use in the query
   */
  private _calculateEffectiveLimit(requestedLimit?: number): number {
    if (requestedLimit === undefined) {
      return DEFAULT_PROPERTIES_LIMIT;
    }

    // Clamp between 1 and MAX_PROPERTIES_LIMIT
    return Math.max(1, Math.min(requestedLimit, MAX_PROPERTIES_LIMIT));
  }

  /**
   * Returns the minimum zoom level required to load properties.
   *
   * @returns Minimum zoom level constant
   */
  public getMinimumZoomLevel(): number {
    return MINIMUM_ZOOM_LEVEL;
  }
}
