import { PrismaClient } from '@prisma/client';
import { Client as PgClient } from 'pg';
import { createPrismaClient, SettingsService, buildDatabaseUrl } from '@neurastate/shared';
import { copyFrom } from '@neurastate/shared';

const DEFAULT_IMPORT_URL = 'https://example.com/neurastate/property_point_view.csv';

const PROPERTY_POINT_VIEW_STAGING_TABLE = 'neurastate.property_point_view_staging';
const PROPERTY_POINT_VIEW_TABLE = 'neurastate.property_point_view';

interface IDataHubImportOptions {
  url?: string;
  chunkSize?: number;
}

/**
 * Service responsible for importing external data into Cloud SQL (Postgres).
 * This implementation focuses on the neurastate.property_point_view table.
 */
export class DataHubImportService {
  private readonly _prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this._prisma = prismaClient ?? createPrismaClient();
  }

  /**
   * Import property_point_view data from a remote CSV into Postgres via Prisma.
   * If a row already exists (by objectid), it will be updated; otherwise inserted.
   */
  public async importPropertyPointView(options?: IDataHubImportOptions): Promise<number> {
    const importUrl = await this._resolveImportUrl(options?.url);
    console.log('[DataHubImportService] Starting importPropertyPointView with COPY FROM STDIN');
    console.log('[DataHubImportService] Import URL:', importUrl);

    const affectedCount = await this._copyFromUrlToPropertyPointView(importUrl);

    console.log('[DataHubImportService] Import completed. Total affected rows:', affectedCount);

    return affectedCount;
  }

  /**
   * Perform a high-throughput import using PostgreSQL COPY FROM STDIN directly into neurastate.property_point_view.
   *
   * This expects the remote CSV to have a header row with column names matching the table columns
   * (x, y, objectid, folio, ttrrss, x_coord, y_coord, ..., dateofsale_utc).
   */
  private async _copyFromUrlToPropertyPointView(importUrl: string): Promise<number> {
    const csvResponse = await fetch(importUrl);

    if (!csvResponse.ok || !csvResponse.body) {
      throw new Error(`[DataHubImportService] Failed to download CSV for COPY. Status: ${csvResponse.status}`);
    }

    const connectionString = buildDatabaseUrl();

    const client = new PgClient({ connectionString });
    await client.connect();

    console.log('[DataHubImportService] Connected to Postgres. Starting COPY → neurastate.property_point_view');

    await this._truncatePropertyPointViewStaging(client);

    const copySql = this._buildCopyIntoStagingSql();

    const copyStream = client.query(copyFrom(copySql));

    // Convert web ReadableStream to Node.js Readable
    const nodeStream = (csvResponse.body as any).pipe
      ? (csvResponse.body as any)
      : (await import('stream')).Readable.fromWeb(csvResponse.body as any);

    let totalBytes = 0;

    return new Promise<number>((resolve, reject) => {
      nodeStream
        .on('data', (chunk: Buffer) => {
          totalBytes += chunk.length;
        })
        .on('error', (err: Error) => {
          console.error('[DataHubImportService] Error reading CSV stream:', err);
          reject(err);
        })
        .pipe(copyStream)
        .on('error', (err: Error) => {
          console.error('[DataHubImportService] Error during COPY FROM STDIN:', err);
          reject(err);
        })
        .on('finish', async () => {
          try {
            console.log('[DataHubImportService] COPY completed. Bytes streamed:', totalBytes);

            console.log('[DataHubImportService] Starting upsert from staging into property_point_view');
            const upsertedCount = await this._upsertFromStaging(client);
            console.log('[DataHubImportService] Upsert from staging completed. Rows affected:', upsertedCount);

            console.log('[DataHubImportService] Updating geom_raw using x_coord and y_coord');
            const updatedGeomRawCount = await this._updateGeomRaw(client);
            console.log('[DataHubImportService] geom_raw update completed. Rows affected:', updatedGeomRawCount);

            console.log('[DataHubImportService] Updating geom by transforming geom_raw to SRID 4326');
            const updatedGeomCount = await this._updateGeom(client);
            console.log('[DataHubImportService] geom update completed. Rows affected:', updatedGeomCount);

            const countResult = await client.query<{
              count: string;
            }>('SELECT COUNT(*)::text AS count FROM neurastate.property_point_view');
            const totalCount = parseInt(countResult.rows[0]?.count ?? '0', 10);
            console.log('[DataHubImportService] Total rows currently in neurastate.property_point_view:', totalCount);

            await client.end();
            resolve(totalCount);
          } catch (err) {
            console.error('[DataHubImportService] Error finalizing COPY transaction:', err);
            try {
              await client.end();
            } catch {
              // ignore
            }
            reject(err as Error);
          }
        });
    });
  }

  /**
   * Resolve the import URL using explicit parameter, settings service, or default.
   */
  private async _resolveImportUrl(explicitUrl?: string): Promise<string> {
    if (explicitUrl) {
      return explicitUrl;
    }

    const settingsService = new SettingsService(this._prisma);
    const settings = await settingsService.getFirstSettings();

    if (settings?.datasetPointOfViewUrl) {
      return settings.datasetPointOfViewUrl;
    }

    return DEFAULT_IMPORT_URL;
  }

  /**
   * Truncate the property_point_view staging table before a new import.
   * Ensures we always start from a clean staging area.
   */
  private async _truncatePropertyPointViewStaging(client: PgClient): Promise<void> {
    console.log('[DataHubImportService] Truncating staging table:', PROPERTY_POINT_VIEW_STAGING_TABLE);
    await client.query(`TRUNCATE TABLE ${PROPERTY_POINT_VIEW_STAGING_TABLE}`);
  }

  /**
   * Build the COPY FROM STDIN SQL used to stream the CSV into the staging table.
   */
  private _buildCopyIntoStagingSql(): string {
    return `
      COPY ${PROPERTY_POINT_VIEW_STAGING_TABLE} (
        x,
        y,
        objectid,
        folio,
        ttrrss,
        x_coord,
        y_coord,
        true_site_addr,
        true_site_unit,
        true_site_city,
        true_site_zip_code,
        true_mailing_addr1,
        true_mailing_addr2,
        true_mailing_addr3,
        true_mailing_city,
        true_mailing_state,
        true_mailing_zip_code,
        true_mailing_country,
        true_owner1,
        true_owner2,
        true_owner3,
        condo_flag,
        parent_folio,
        dor_code_cur,
        dor_desc,
        subdivision,
        bedroom_count,
        bathroom_count,
        half_bathroom_count,
        floor_count,
        unit_count,
        building_actual_area,
        building_heated_area,
        lot_size,
        year_built,
        assessment_year_cur,
        assessed_val_cur,
        dos_1,
        price_1,
        legal,
        pid,
        dateofsale_utc
      )
      FROM STDIN
      WITH (FORMAT csv, HEADER true)
    `;
  }

  /**
   * Upsert records from the staging table into neurastate.property_point_view.
   */
  private async _upsertFromStaging(client: PgClient): Promise<number> {
    const result = await client.query(`
      INSERT INTO ${PROPERTY_POINT_VIEW_TABLE} (
        x,
        y,
        objectid,
        folio,
        ttrrss,
        x_coord,
        y_coord,
        true_site_addr,
        true_site_unit,
        true_site_city,
        true_site_zip_code,
        true_mailing_addr1,
        true_mailing_addr2,
        true_mailing_addr3,
        true_mailing_city,
        true_mailing_state,
        true_mailing_zip_code,
        true_mailing_country,
        true_owner1,
        true_owner2,
        true_owner3,
        condo_flag,
        parent_folio,
        dor_code_cur,
        dor_desc,
        subdivision,
        bedroom_count,
        bathroom_count,
        half_bathroom_count,
        floor_count,
        unit_count,
        building_actual_area,
        building_heated_area,
        lot_size,
        year_built,
        assessment_year_cur,
        assessed_val_cur,
        dos_1,
        price_1,
        legal,
        pid,
        dateofsale_utc,
        search_all,
        created_at,
        updated_at
      )
      SELECT
        x,
        y,
        objectid,
        folio,
        ttrrss,
        x_coord,
        y_coord,
        true_site_addr,
        true_site_unit,
        true_site_city,
        true_site_zip_code,
        true_mailing_addr1,
        true_mailing_addr2,
        true_mailing_addr3,
        true_mailing_city,
        true_mailing_state,
        true_mailing_zip_code,
        true_mailing_country,
        true_owner1,
        true_owner2,
        true_owner3,
        CASE
          WHEN lower(s.condo_flag::text) = 'y' THEN true
          ELSE false
        END AS condo_flag,
        parent_folio,
        dor_code_cur,
        dor_desc,
        subdivision,
        bedroom_count,
        bathroom_count,
        half_bathroom_count,
        floor_count,
        unit_count,
        building_actual_area,
        building_heated_area,
        lot_size,
        year_built,
        assessment_year_cur,
        assessed_val_cur,
        dos_1,
        price_1,
        legal,
        pid,
        dateofsale_utc,
        unaccent(lower(
            coalesce(s.folio,'') || ' ' ||
            coalesce(s.true_site_addr,'') || ' ' ||
            coalesce(s.true_site_unit,'') || ' ' ||
            coalesce(s.true_site_city,'') || ' ' ||
            coalesce(s.true_owner1,'') || ' ' ||
            coalesce(s.true_owner2,'') || ' ' ||
            coalesce(s.true_owner3,'') || ' ' ||
            coalesce(s.dor_desc,'') || ' ' ||
            coalesce(s.subdivision,'')
        )) AS search_all,
        NOW() AS created_at,
        NOW() AS updated_at
      FROM ${PROPERTY_POINT_VIEW_STAGING_TABLE} s
      ON CONFLICT (objectid) DO UPDATE SET
        x = EXCLUDED.x,
        y = EXCLUDED.y,
        folio = EXCLUDED.folio,
        ttrrss = EXCLUDED.ttrrss,
        x_coord = EXCLUDED.x_coord,
        y_coord = EXCLUDED.y_coord,
        true_site_addr = EXCLUDED.true_site_addr,
        true_site_unit = EXCLUDED.true_site_unit,
        true_site_city = EXCLUDED.true_site_city,
        true_site_zip_code = EXCLUDED.true_site_zip_code,
        true_mailing_addr1 = EXCLUDED.true_mailing_addr1,
        true_mailing_addr2 = EXCLUDED.true_mailing_addr2,
        true_mailing_addr3 = EXCLUDED.true_mailing_addr3,
        true_mailing_city = EXCLUDED.true_mailing_city,
        true_mailing_state = EXCLUDED.true_mailing_state,
        true_mailing_zip_code = EXCLUDED.true_mailing_zip_code,
        true_mailing_country = EXCLUDED.true_mailing_country,
        true_owner1 = EXCLUDED.true_owner1,
        true_owner2 = EXCLUDED.true_owner2,
        true_owner3 = EXCLUDED.true_owner3,
        condo_flag = EXCLUDED.condo_flag,
        parent_folio = EXCLUDED.parent_folio,
        dor_code_cur = EXCLUDED.dor_code_cur,
        dor_desc = EXCLUDED.dor_desc,
        subdivision = EXCLUDED.subdivision,
        bedroom_count = EXCLUDED.bedroom_count,
        bathroom_count = EXCLUDED.bathroom_count,
        half_bathroom_count = EXCLUDED.half_bathroom_count,
        floor_count = EXCLUDED.floor_count,
        unit_count = EXCLUDED.unit_count,
        building_actual_area = EXCLUDED.building_actual_area,
        building_heated_area = EXCLUDED.building_heated_area,
        lot_size = EXCLUDED.lot_size,
        year_built = EXCLUDED.year_built,
        assessment_year_cur = EXCLUDED.assessment_year_cur,
        assessed_val_cur = EXCLUDED.assessed_val_cur,
        dos_1 = EXCLUDED.dos_1,
        price_1 = EXCLUDED.price_1,
        legal = EXCLUDED.legal,
        pid = EXCLUDED.pid,
        dateofsale_utc = EXCLUDED.dateofsale_utc,
        search_all = EXCLUDED.search_all,
        updated_at = NOW();
    `);

    return result.rowCount ?? 0;
  }

  /**
   * Populate geom_raw from x_coord and y_coord (SRID 2236).
   */
  private async _updateGeomRaw(client: PgClient): Promise<number> {
    const result = await client.query(`
      UPDATE neurastate.property_point_view
      SET geom_raw = ST_SetSRID(
        ST_MakePoint(x_coord, y_coord),
        2236
      )
      WHERE x_coord IS NOT NULL
        AND y_coord IS NOT NULL;
    `);

    return result.rowCount ?? 0;
  }

  /**
   * Populate geom by transforming geom_raw to SRID 4326.
   */
  private async _updateGeom(client: PgClient): Promise<number> {
    const result = await client.query(`
      UPDATE neurastate.property_point_view
      SET geom = ST_Transform(geom_raw, 4326)
      WHERE geom_raw IS NOT NULL;
    `);

    return result.rowCount ?? 0;
  }

  /**
   * Convert a raw CSV record into a typed IPropertyPointViewRow.
   */
}
