import { PrismaClient } from '@prisma/client';

/**
 * Create and configure a PrismaClient instance for Google Cloud SQL.
 */
export function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}
