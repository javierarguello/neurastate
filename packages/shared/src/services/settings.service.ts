import { PrismaClient } from '@prisma/client';
import { createPrismaClient } from '../utils/prisma.factory';
import type { ISettings } from '../types';

/**
 * Service responsible for accessing neurastate.settings records.
 */
export class SettingsService {
  private readonly _prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this._prisma = prismaClient ?? createPrismaClient();
  }

  /**
   * Retrieve the first Settings record ordered by primary key.
   *
   * Returns null if the table is empty.
   */
  public async getFirstSettings(): Promise<ISettings | null> {
    const record = await this._prisma.settings.findFirst({
      orderBy: { id: 'asc' }
    });

    if (!record) {
      return null;
    }

    return {
      id: record.id,
      datasetPointOfViewUrl: record.datasetPointOfViewUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }
}
