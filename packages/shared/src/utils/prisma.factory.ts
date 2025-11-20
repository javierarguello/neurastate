import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { buildDatabaseConfig } from './db.config';

/**
 * Create and configure a PrismaClient instance for Google Cloud SQL.
 *
 * Constructs connection from individual environment variables:
 * - DB_INSTANCE_HOST: Database host/IP
 * - DB_USER: Database user
 * - DB_PASS: Database password (supports special characters)
 * - DB_NAME: Database name
 * - DB_PORT: Optional database port (defaults to 5432)
 * - DB_SSL: Optional SSL flag (defaults to true)
 * - NODE_TLS_REJECT_UNAUTHORIZED: Optional TLS validation (defaults to true)
 *
 * @returns Configured PrismaClient instance with pg adapter
 */
export function createPrismaClient(): PrismaClient {
  const config = buildDatabaseConfig();

  const pool = new Pool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
    ssl: config.sslMode === 'disable'
      ? false
      : {
          rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
        }
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}
