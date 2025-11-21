import { Client as PgClient } from 'pg';

/**
 * Table name constant for property point view
 */
const PROPERTY_POINT_VIEW_TABLE = 'neurastate.property_point_view';

/**
 * Table name constant for property metadata
 */
const PROPERTY_META_TABLE = 'neurastate.property_meta';

/**
 * Service responsible for general data maintenance and cleanup tasks.
 * Includes operations like updating flags, fixing relationships, and cleaning up data inconsistencies.
 */
export class DataMaintenanceService {
  constructor() {
    // Service uses direct PgClient connections for performance-critical operations
  }

  /**
   * Updates the is_parent_folio column for properties that have children.
   * Sets is_parent_folio = true for properties that are referenced as parent_folio by other records.
   * Only updates records where is_parent_folio is false or null (avoids unnecessary updates).
   *
   * Uses optimized raw SQL with pg client for optimal performance on large datasets.
   *
   * @returns Number of properties updated and final counts
   */
  public async updateParentFolioFlags(): Promise<{
    totalUpdated: number;
    parentsFound: number;
    nonParentsFound: number;
  }> {
    console.log('[DataMaintenanceService] Starting parent folio flag update');

    // Get database connection details from environment
    const connectionConfig = this._buildConnectionConfig();

    // Create direct pg client for raw SQL operations
    const pgClient = new PgClient(connectionConfig);

    try {
      await pgClient.connect();
      console.log('[DataMaintenanceService] Connected to database');

      // Update is_parent_folio = true for folios that are referenced as parent_folio by other records
      // Only updates records that are not already marked as parent (is_parent_folio is false or null)
      console.log('[DataMaintenanceService] Identifying and marking parent folios');
      const updateResult = await pgClient.query(`
        UPDATE ${PROPERTY_POINT_VIEW_TABLE} p
        SET is_parent_folio = true
        FROM (
          SELECT DISTINCT parent_folio
          FROM ${PROPERTY_POINT_VIEW_TABLE}
          WHERE parent_folio IS NOT NULL
            AND parent_folio <> ''
        ) c
        WHERE p.folio = c.parent_folio
          AND (NOT p.is_parent_folio OR p.is_parent_folio IS NULL)
      `);

      const rowsUpdated = updateResult.rowCount || 0;
      console.log(`[DataMaintenanceService] Updated ${rowsUpdated} properties to is_parent_folio = true`);

      // Get final counts for reporting
      const countResult = await pgClient.query(`
        SELECT
          COUNT(*) FILTER (WHERE is_parent_folio = true) as parent_count,
          COUNT(*) FILTER (WHERE is_parent_folio = false OR is_parent_folio IS NULL) as non_parent_count,
          COUNT(*) as total_count
        FROM ${PROPERTY_POINT_VIEW_TABLE}
      `);

      const counts = countResult.rows[0];
      const totalProperties = parseInt(counts.total_count);
      const parentsCount = parseInt(counts.parent_count);
      const nonParentsCount = parseInt(counts.non_parent_count);

      console.log('[DataMaintenanceService] Update completed:');
      console.log(`  - Rows updated: ${rowsUpdated}`);
      console.log(`  - Total properties: ${totalProperties}`);
      console.log(`  - Parent folios: ${parentsCount}`);
      console.log(`  - Non-parent folios: ${nonParentsCount}`);

      return {
        totalUpdated: rowsUpdated,
        parentsFound: parentsCount,
        nonParentsFound: nonParentsCount,
      };
    } finally {
      await pgClient.end();
      console.log('[DataMaintenanceService] Database connection closed');
    }
  }

  /**
   * Updates metadata for all properties in property_meta table.
   * Currently calculates and updates:
   *   - children_count: number of children for each parent property
   *
   * For each property with is_parent_folio = true, counts how many children reference it
   * and inserts or updates the record in property_meta table.
   *
   * Uses UPSERT (INSERT ... ON CONFLICT ... DO UPDATE) to handle both insert and update cases.
   *
   * @returns Number of property_meta records inserted or updated
   */
  public async updateMeta(): Promise<{
    totalUpserted: number;
    totalParentsProcessed: number;
  }> {
    console.log('[DataMaintenanceService] Starting property_meta update');

    // Get database connection details from environment
    const connectionConfig = this._buildConnectionConfig();

    // Create direct pg client for raw SQL operations
    const pgClient = new PgClient(connectionConfig);

    try {
      await pgClient.connect();
      console.log('[DataMaintenanceService] Connected to database');

      // Calculate children_count for each parent property and upsert into property_meta
      // Uses INNER JOIN to count children for each parent folio
      // Filters by object_id to prevent self-references
      // ON CONFLICT updates existing records, otherwise inserts new ones
      console.log('[DataMaintenanceService] Calculating and upserting property metadata');
      const upsertResult = await pgClient.query(`
        INSERT INTO ${PROPERTY_META_TABLE} (object_id, folio, children_count)
        SELECT
          p.objectid,
          p.folio,
          COUNT(c.objectid) as children_count
        FROM ${PROPERTY_POINT_VIEW_TABLE} p
        INNER JOIN ${PROPERTY_POINT_VIEW_TABLE} c
          ON c.parent_folio = p.folio
          AND c.parent_folio IS NOT NULL
          AND c.parent_folio <> ''
          AND c.objectid != p.objectid
        WHERE p.is_parent_folio = true
        GROUP BY p.objectid, p.folio
        ON CONFLICT (object_id)
        DO UPDATE SET
          children_count = EXCLUDED.children_count,
          folio = EXCLUDED.folio
      `);

      const rowsUpserted = upsertResult.rowCount || 0;
      console.log(`[DataMaintenanceService] Upserted ${rowsUpserted} records to property_meta`);

      // Get count of parent properties for verification
      const parentCountResult = await pgClient.query(`
        SELECT COUNT(*) as parent_count
        FROM ${PROPERTY_POINT_VIEW_TABLE}
        WHERE is_parent_folio = true
      `);

      const totalParents = parseInt(parentCountResult.rows[0].parent_count);

      console.log('[DataMaintenanceService] Property metadata update completed:');
      console.log(`  - Records upserted: ${rowsUpserted}`);
      console.log(`  - Total parent properties: ${totalParents}`);

      return {
        totalUpserted: rowsUpserted,
        totalParentsProcessed: totalParents,
      };
    } finally {
      await pgClient.end();
      console.log('[DataMaintenanceService] Database connection closed');
    }
  }

  /**
   * Builds database connection configuration from environment variables.
   *
   * @returns PostgreSQL client configuration object
   * @throws Error if required environment variables are missing
   */
  private _buildConnectionConfig() {
    const host = process.env.DB_INSTANCE_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const database = process.env.DB_NAME;
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

    if (!host) {
      throw new Error('[DataMaintenanceService] DB_INSTANCE_HOST is not defined');
    }
    if (!user) {
      throw new Error('[DataMaintenanceService] DB_USER is not defined');
    }
    if (!password) {
      throw new Error('[DataMaintenanceService] DB_PASS is not defined');
    }
    if (!database) {
      throw new Error('[DataMaintenanceService] DB_NAME is not defined');
    }

    // SSL configuration
    const sslEnabled = process.env.DB_SSL !== 'false';
    const rejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0';

    return {
      host,
      user,
      password,
      database,
      port,
      ssl: sslEnabled ? { rejectUnauthorized } : false,
    };
  }
}
