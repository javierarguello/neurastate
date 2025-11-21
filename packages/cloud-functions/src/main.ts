import 'dotenv/config';
import { dataMaintenanceHandler, importPropertyPointViewHandler } from './handlers';

/**
 * Entry point for running cloud-functions handlers locally without emulators
 */
async function main({ action }: { action: string }): Promise<void> {
  switch (action) {
    case 'import-property-point-view':
      console.log('[main] Running import: property_point_view');
      await importPropertyPointViewHandler();
      break;
    case 'data-maintenance':
    case 'data-maintenance:run-all':
      console.log('[main] Running all data maintenance tasks');
      const allResult = await dataMaintenanceHandler({ task: 'run-all' });
      console.log('[main] Data maintenance completed:', JSON.stringify(allResult, null, 2));
      if (!allResult.success) {
        process.exit(1);
      }
      break;
    case 'data-maintenance:update-parent-folios':
      console.log('[main] Running data maintenance: update parent folios');
      const parentFolioResult = await dataMaintenanceHandler({ task: 'update-parent-folios' });
      console.log('[main] Data maintenance completed:', JSON.stringify(parentFolioResult, null, 2));
      if (!parentFolioResult.success) {
        process.exit(1);
      }
      break;
    case 'data-maintenance:update-meta':
      console.log('[main] Running data maintenance: update property metadata');
      const metaResult = await dataMaintenanceHandler({ task: 'update-meta' });
      console.log('[main] Data maintenance completed:', JSON.stringify(metaResult, null, 2));
      if (!metaResult.success) {
        process.exit(1);
      }
      break;
    default:
      console.error(`Unknown action: ${action}`);
      console.error('Available actions:');
      console.error('  - import-property-point-view');
      console.error('  - data-maintenance (runs all maintenance tasks - RECOMMENDED)');
      console.error('  - data-maintenance:update-parent-folios (individual task)');
      console.error('  - data-maintenance:update-meta (individual task)');
      process.exit(1);
  }
}

// Execute only when run directly via Node
void main({ action: process.argv[2] });
