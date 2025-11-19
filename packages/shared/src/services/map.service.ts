import { PrismaClient } from '@prisma/client';
import { createPrismaClient } from '../utils/prisma.factory';
import type { IMapProperty, IMapPropertyFilters } from '../types';

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
 * Service responsible for querying property data optimized for map display.
 * Uses spatial indexing (PostGIS) for efficient bounding box queries.
 */
export class MapService {
  private readonly _prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    console.log('prismaClient', process.env.DATABASE_URL);
    this._prisma = prismaClient ?? createPrismaClient();
  }

  /**
   * Retrieves properties within a geographic bounding box.
   *
   * Uses PostGIS spatial operators with the GiST index on the `geom` column
   * for optimal performance. Only returns properties with valid coordinates.
   *
   * @param filters - Filter parameters including bounding box and optional limit
   * @returns Array of lightweight property objects optimized for map markers
   */
  public async getPropertiesInBounds(filters: IMapPropertyFilters): Promise<IMapProperty[]> {
    const { bbox, limit } = filters;

    // Apply limit with bounds checking
    const effectiveLimit = this._calculateEffectiveLimit(limit);

    // Use raw SQL with PostGIS for spatial query
    // ST_MakeEnvelope creates a bbox, && operator uses the GiST index
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
      WHERE
        geom IS NOT NULL
        AND geom && ST_MakeEnvelope(
          ${bbox.minLng}::double precision,
          ${bbox.minLat}::double precision,
          ${bbox.maxLng}::double precision,
          ${bbox.maxLat}::double precision,
          4326
        )
      LIMIT ${effectiveLimit}
    `;

    return properties;
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
}
