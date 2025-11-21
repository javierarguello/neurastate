import { DataHubImportService } from '../services';

/**
 * Handler for importing property_point_view data from the external DataHub source.
 *
 * Intended to be invoked from the CLI entrypoint (main.ts) or a Cloud Function
 * wrapper, keeping business logic inside the service layer.
 */
export async function importPropertyPointViewHandler(): Promise<void> {
  console.log('[importPropertyPointViewHandler] Starting property_point_view import');

  const service = new DataHubImportService();

  try {
    const totalRows = await service.importPropertyPointView();
    console.log(
      '[importPropertyPointViewHandler] Import completed successfully. Total rows in property_point_view:',
      totalRows
    );
  } catch (error) {
    console.error('[importPropertyPointViewHandler] Error during property_point_view import:', error);
    throw error;
  }
}
