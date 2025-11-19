import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'packages/shared/prisma/schema.prisma',
  migrations: {
    path: 'packages/shared/prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
