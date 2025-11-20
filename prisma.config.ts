import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { buildDatabaseUrl } from './packages/shared/src/utils/db.config';

export default defineConfig({
  schema: 'packages/shared/prisma/schema.prisma',
  migrations: {
    path: 'packages/shared/prisma/migrations'
  },
  datasource: {
    url: buildDatabaseUrl()
  }
});
