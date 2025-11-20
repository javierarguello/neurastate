
Neurastate Monorepo
====================

Modern real estate analytics platform built with Next.js, Cloud Functions, and PostgreSQL. This repository is structured as a Turborepo monorepo with a web app, shared library, and cloud functions.

This document is written to help both humans and AI coding agents quickly understand the structure, main responsibilities, and how to run the project locally.

Monorepo Structure
------------------

- **apps/web**
  - Next.js 14 application (App Router).
  - Public marketing/analytics UI and minimal API endpoints for demo purposes.

- **packages/shared**
  - Shared TypeScript library used by both the web app and cloud functions.
  - Contains:
    - Prisma schema and factory.
    - Shared SQL schema for bootstrapping the database.
    - Domain types and interfaces.
    - Utilities, helpers, and validators.
    - Settings service for configuration stored in the database.

- **packages/cloud-functions**
  - Node/TypeScript code compiled to be deployed as Cloud Functions (or run as a CLI-like script locally).
  - Contains handlers for email, market analytics, property notifications, and a high-throughput data import service.

High-Level Domain Overview
--------------------------

- **Core dataset**: `neurastate.property_point_view`
  - Stores property-level data (location, owner, building attributes, valuation, sale information, etc.).
  - Backed by PostgreSQL.
  - Modeled in Prisma as the `PropertyPointView` model.

- **Settings**: `neurastate.settings`
  - Holds configuration such as the external CSV URL used for imports.
  - Accessed via `SettingsService` in the shared package.

Key Packages and Services
-------------------------

### apps/web

Location: `apps/web`

- **Framework**: Next.js 14 (App Router).
- **Styling**: Tailwind CSS + shadcn/ui.
- **Purpose**:
  - Public-facing marketing / analytics UI.
  - Simple API routes for:
    - Market stats and trends.
    - Property listings.
    - Contact form.

Important folders:

- `src/app/`
  - **`page.tsx`**: Landing page.
  - **`api/*/route.ts`**: HTTP endpoints for market stats, trends, properties, and contact.

- `src/services/client/*`
  - Thin client wrappers for calling the Next.js API routes from the React components.

- `src/services/server/*`
  - Server-side services that encapsulate the business logic behind the API routes.

### packages/shared

Location: `packages/shared`

This package is the central shared layer for types, database schema, and utilities.

Key components:

- **Prisma schema**: `prisma/schema.prisma`
  - Datasource: PostgreSQL, configured via `prisma.config.ts` using `DATABASE_URL` from `.env`.
  - Schemas: `neurastate` (multi-schema configuration in Prisma 7).
  - Model **`PropertyPointView`**
    - Maps to `neurastate.property_point_view`.
    - Uses `Decimal` for numeric fields that may contain fractions (bathrooms, areas, etc.).
    - Uses `Int` for identifiers and years.
    - Includes raw and transformed geometry fields (`geomRaw` / `geom`).
  - Model **`Settings`**
    - Maps to `neurastate.settings`.

- **SQL bootstrap schema**: `sql/schema.sql`
  - Creates the `neurastate` schema.
  - Defines:
    - `neurastate.property_point_view` (main table), including `geom_raw` (SRID 2236) and `geom` (SRID 4326) plus a GiST index on `geom`.
    - `neurastate.property_point_view_staging` (staging table used for bulk imports).
    - `neurastate.settings`.

- **Prisma factory**: `src/utils/prisma.factory.ts`
  - `createPrismaClient()` returns a configured `PrismaClient` instance.
  - Uses Prisma 7 with the Postgres driver adapter `@prisma/adapter-pg` and a `pg` connection pool configured to use the `neurastate` schema.

- **Settings service**: `src/services/settings.service.ts`
  - `SettingsService` provides methods to read configuration, such as the dataset URL used by the data import service.

- **Types**: `src/types/index.ts`
  - Includes `IPropertyPointViewRow`, a TypeScript interface representing a row from the property point view dataset.
  - Other generic API response types.

- **Utilities**:
  - `src/utils/helpers.ts`: Generic helpers (ID generation, clamp, grouping, etc.).
  - `src/utils/formatters.ts`, `src/utils/validators.ts`: Formatting and validation helpers.
  - `src/utils/pg-copy-streams.ts`: Typed wrapper around `pg-copy-streams` for PostgreSQL `COPY FROM STDIN` streaming.

### packages/cloud-functions

Location: `packages/cloud-functions`

This package contains the backend logic intended for Cloud Functions. It can also be executed locally as a Node script.

Entry points:

- `src/main.ts`
  - CLI-style entry used during development.
  - Example command (from repo root):
    - `node ./packages/cloud-functions/dist/main.js import-property-point-view`

- `src/index.ts`
  - Exported handlers for Cloud Functions deployment.

Key services:

- **DataHubImportService**: `src/services/data.hub.import.service.ts`
  - Responsibility: import external CSV data into PostgreSQL with high throughput.
  - Steps:
    1. Resolve the import URL using `SettingsService` or a default.
    2. Download the CSV via `fetch` (streaming).
    3. Open a PostgreSQL connection using `pg` and `DATABASE_URL`.
    4. **TRUNCATE** the staging table `neurastate.property_point_view_staging`.
    5. Use `pg-copy-streams` (`COPY FROM STDIN`) to stream the CSV directly into the staging table.
    6. `INSERT ... ON CONFLICT (objectid) DO UPDATE` from staging into `neurastate.property_point_view`:
       - New rows: inserted with `created_at` and `updated_at` set to `NOW()`.
       - Existing rows: updated in place, `updated_at` refreshed to `NOW()`.
    7. Run two sequential `UPDATE` statements on `neurastate.property_point_view`:
       - Populate `geom_raw` from `x_coord` / `y_coord` using `ST_SetSRID(ST_MakePoint(...), 2236)`.
       - Populate `geom` from `geom_raw` using `ST_Transform(geom_raw, 4326)`.
    8. Log the total row count in `neurastate.property_point_view` and return it.

  - Environment:
    - Requires `DATABASE_URL` in `.env`.
    - For development, TLS issues against the external CSV endpoint can be bypassed with `NODE_TLS_REJECT_UNAUTHORIZED=0` (development only).

- **Other handlers** (overview):
  - `src/handlers/email-handler.ts`: Email-related Cloud Function logic.
  - `src/handlers/market-analytics.ts`: Market analytics processing.
  - `src/handlers/property-notifications.ts`: Notifications related to property changes/events.

Local Development
-----------------

### Prerequisites

- Node.js (version compatible with the repo, e.g. 20+).
- pnpm.
- PostgreSQL instance (local or remote) with access for your machine.

### Environment variables

Create a `.env` in the repo root based on `.env.example` and add at least:

```env
# Database connection (individual variables avoid URL encoding issues)
DB_INSTANCE_HOST=your-database-host
DB_USER=postgres
DB_PASS=your-password-with-special-chars
DB_NAME=neurastate

# Optional: Set to 0 to bypass TLS certificate validation (development only)
NODE_TLS_REJECT_UNAUTHORIZED=0

# GCP configuration
GCP_PROJECT_ID=your-project-id
GCP_REGION=us-central1

# Next.js configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Note**: The database connection uses individual environment variables (`DB_INSTANCE_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`) instead of a single `DATABASE_URL`. This approach avoids URL encoding issues with special characters in passwords (e.g., `$`, `{`, `}`, `=`).

### Install dependencies

From the repo root:

```bash
pnpm install
```

### Database setup

1. Apply the SQL schema in `packages/shared/sql/schema.sql` to your PostgreSQL database. Example:

   ```bash
   psql "$DATABASE_URL" -f packages/shared/sql/schema.sql
   ```

2. Generate Prisma client:

   ```bash
   pnpm prisma
   ```

### Build all packages

```bash
pnpm build
```

### Run the web app (Next.js)

```bash
cd apps/web
pnpm dev
```

Then open http://localhost:3000.

### Run the data import locally

From the repo root, after building cloud functions:

```bash
pnpm run build:functions

# For development: bypass TLS certificate verification against the external CSV source
NODE_TLS_REJECT_UNAUTHORIZED=0 node ./packages/cloud-functions/dist/main.js import-property-point-view
```

This will:

- Download the external CSV.
- Stream it into `neurastate.property_point_view_staging` using `COPY FROM STDIN`.
- Upsert into `neurastate.property_point_view`.

Notes for AI/Automation Agents
------------------------------

- **Primary context for data model**:
  - `packages/shared/prisma/schema.prisma`
  - `packages/shared/sql/schema.sql`

- **Primary context for backend data ingest**:
  - `packages/cloud-functions/src/services/data.hub.import.service.ts`

- **Shared types and utilities**:
  - `packages/shared/src/types/index.ts`
  - `packages/shared/src/utils/*`

- **Web UI and public APIs**:
  - `apps/web/src/app/**`
  - `apps/web/src/services/**`

When extending functionality, prefer updating shared types and services in `packages/shared` and consuming them from both the web app and cloud functions to keep behavior consistent.

