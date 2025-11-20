export interface IDatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  schema: string;
  sslMode: string;
}

const DATABASE_SCHEMA = 'neurastate';
const DEFAULT_POSTGRES_PORT = 5432;

export function buildDatabaseConfig(): IDatabaseConfig {
  const host = process.env.DB_INSTANCE_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const database = process.env.DB_NAME;

  if (!host) {
    throw new Error('[db.config] DB_INSTANCE_HOST is not defined');
  }
  if (!user) {
    throw new Error('[db.config] DB_USER is not defined');
  }
  if (!password) {
    throw new Error('[db.config] DB_PASS is not defined');
  }
  if (!database) {
    throw new Error('[db.config] DB_NAME is not defined');
  }

  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : DEFAULT_POSTGRES_PORT;
  const sslMode = process.env.DB_SSLMODE ?? 'require';

  return {
    host,
    user,
    password,
    database,
    port,
    schema: DATABASE_SCHEMA,
    sslMode,
  };
}

export function buildDatabaseUrl(config: IDatabaseConfig = buildDatabaseConfig()): string {
  const searchParams = new URLSearchParams();
  searchParams.set('schema', config.schema);
  if (config.sslMode) {
    searchParams.set('sslmode', config.sslMode);
  }

  const encodedUser = encodeURIComponent(config.user);
  const encodedPassword = encodeURIComponent(config.password);

  return `postgresql://${encodedUser}:${encodedPassword}@${config.host}:${config.port}/${config.database}?${searchParams.toString()}`;
}
