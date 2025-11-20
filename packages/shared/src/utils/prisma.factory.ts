import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * Database connection configuration interface.
 * Uses individual environment variables to avoid URL encoding issues.
 */
interface IDatabaseConfig {
  /** Database host (IP or hostname) */
  host: string;
  /** Database user */
  user: string;
  /** Database password (supports special characters) */
  password: string;
  /** Database name */
  database: string;
  /** Database port (defaults to 5432) */
  port: number;
  /** Schema to use (defaults to 'neurastate') */
  schema: string;
  /** SSL configuration */
  ssl: boolean | { rejectUnauthorized: boolean };
}

/**
 * Schema name used for all database operations.
 * Must match the schema defined in Prisma schema.
 */
const DATABASE_SCHEMA = 'neurastate';

/**
 * Default PostgreSQL port.
 */
const DEFAULT_POSTGRES_PORT = 5432;

/**
 * Builds database configuration from environment variables.
 *
 * Reads individual connection parameters to avoid URL encoding issues
 * with special characters in passwords.
 *
 * @returns Database configuration object
 * @throws Error if required environment variables are missing
 */
function _buildDatabaseConfig(): IDatabaseConfig {
  const host = process.env.DB_INSTANCE_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const database = process.env.DB_NAME;

  // Validate required environment variables
  if (!host) {
    throw new Error('[createPrismaClient] DB_INSTANCE_HOST is not defined');
  }
  if (!user) {
    throw new Error('[createPrismaClient] DB_USER is not defined');
  }
  if (!password) {
    throw new Error('[createPrismaClient] DB_PASS is not defined');
  }
  if (!database) {
    throw new Error('[createPrismaClient] DB_NAME is not defined');
  }

  // Parse optional configuration
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : DEFAULT_POSTGRES_PORT;

  // SSL configuration
  const sslEnabled = process.env.DB_SSL !== 'false';
  const rejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0';

  return {
    host,
    user,
    password,
    database,
    port,
    schema: DATABASE_SCHEMA,
    ssl: sslEnabled ? { rejectUnauthorized } : false
  };
}

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
  const config = _buildDatabaseConfig();

  const pool = new Pool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
    ssl: config.ssl
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}
