# Neurastate Monorepo

Modern real estate analytics platform built with Next.js and Cloud Functions.

## Structure

- `apps/web` - Next.js web application (deployed to Cloud Run)
- `packages/shared` - Shared utilities and helpers
- `packages/cloud-functions` - Cloud Functions handlers

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build all packages
pnpm build
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Deployment**: Google Cloud Run + Cloud Functions
- **CI/CD**: GitHub Actions
