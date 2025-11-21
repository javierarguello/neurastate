import { DataMaintenanceService } from '../services/data-maintenance.service';

/**
 * Available data maintenance tasks
 */
export type DataMaintenanceTask = 'update-parent-folios' | 'update-meta' | 'run-all';

/**
 * Parameters for data maintenance handler
 */
export interface IDataMaintenanceParams {
  task: DataMaintenanceTask;
}

/**
 * Result of a data maintenance operation
 */
export interface IDataMaintenanceResult {
  success: boolean;
  message: string;
  data?: {
    totalUpdated?: number;
    parentsFound?: number;
    nonParentsFound?: number;
    totalUpserted?: number;
    totalParentsProcessed?: number;
    tasks?: Array<{
      name: string;
      success: boolean;
      data?: Record<string, unknown>;
    }>;
  };
  error?: string;
}

/**
 * Cloud Function handler for general data maintenance tasks.
 * Currently supports:
 *   - update-parent-folios: Updates parent folio flags in property_point_view table
 *   - update-meta: Calculates and updates property_meta table (children_count, etc.)
 *   - run-all: Runs all maintenance tasks in sequence (parent folios first, then meta)
 *
 * Example invocation:
 *   - CLI: node dist/main.js data-maintenance:run-all (recommended)
 *   - CLI: node dist/main.js data-maintenance:update-parent-folios
 *   - CLI: node dist/main.js data-maintenance:update-meta
 *
 * @param params - Parameters including the task to execute
 * @returns Result of the maintenance operation
 */
export async function dataMaintenanceHandler(params: IDataMaintenanceParams): Promise<IDataMaintenanceResult> {
  try {
    const { task } = params;
    console.log(`[dataMaintenanceHandler] Starting data maintenance task: ${task}`);

    const service = new DataMaintenanceService();

    // Execute the requested maintenance task
    if (task === 'update-parent-folios') {
      const result = await service.updateParentFolioFlags();
      console.log('[dataMaintenanceHandler] Parent folio update completed successfully');

      return {
        success: true,
        message: 'Parent folio flags updated successfully',
        data: {
          totalUpdated: result.totalUpdated,
          parentsFound: result.parentsFound,
          nonParentsFound: result.nonParentsFound
        }
      };
    } else if (task === 'update-meta') {
      const result = await service.updateMeta();
      console.log('[dataMaintenanceHandler] Property metadata update completed successfully');

      return {
        success: true,
        message: 'Property metadata updated successfully in property_meta',
        data: {
          totalUpserted: result.totalUpserted,
          totalParentsProcessed: result.totalParentsProcessed
        }
      };
    } else if (task === 'run-all') {
      console.log('[dataMaintenanceHandler] Running all maintenance tasks in sequence');

      const tasks: Array<{ name: string; success: boolean; data?: Record<string, unknown> }> = [];

      // Step 1: Update parent folio flags
      console.log('[dataMaintenanceHandler] Step 1/2: Updating parent folio flags');
      const parentFolioResult = await service.updateParentFolioFlags();
      tasks.push({
        name: 'update-parent-folios',
        success: true,
        data: {
          totalUpdated: parentFolioResult.totalUpdated,
          parentsFound: parentFolioResult.parentsFound,
          nonParentsFound: parentFolioResult.nonParentsFound
        }
      });
      console.log('[dataMaintenanceHandler] Step 1/2 completed');

      // Step 2: Update property metadata
      console.log('[dataMaintenanceHandler] Step 2/2: Updating property metadata');
      const metaResult = await service.updateMeta();
      tasks.push({
        name: 'update-meta',
        success: true,
        data: {
          totalUpserted: metaResult.totalUpserted,
          totalParentsProcessed: metaResult.totalParentsProcessed
        }
      });
      console.log('[dataMaintenanceHandler] Step 2/2 completed');

      console.log('[dataMaintenanceHandler] All maintenance tasks completed successfully');

      return {
        success: true,
        message: 'All data maintenance tasks completed successfully',
        data: { tasks }
      };
    } else {
      throw new Error(`Unknown maintenance task: ${task}`);
    }
  } catch (error) {
    console.error('[dataMaintenanceHandler] Error during data maintenance:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      success: false,
      message: 'Failed to complete data maintenance task',
      error: errorMessage
    };
  }
}
