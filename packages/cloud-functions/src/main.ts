import 'dotenv/config';
import { DataHubImportService } from './services';

/**
 * Entry point for running cloud-functions handlers locally without emulators
 */
async function main({ action }: { action: string }): Promise<void> {
  switch (action) {
    case 'import-property-point-view':
      await new DataHubImportService().importPropertyPointView();
      break;
    default:
      console.error(`Unknown action: ${action}`);
      process.exit(1);
  }
}

// Execute only when run directly via Node
void main({ action: process.argv[2] });
