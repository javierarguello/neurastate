# Getting Started with Neurastate

## Quick Start

```bash
# Install dependencies (requires pnpm)
pnpm install

# Start development server
pnpm dev

# The app will be available at http://localhost:3000
```

## What's Included

### Apps

- **apps/web** - Next.js 14 application with:
  - TypeScript + Tailwind CSS
  - shadcn/ui components
  - App Router
  - Server and client service architecture
  - Beautiful landing page for Neurastate
  - API routes connected to services

### Packages

- **packages/shared** - Common utilities:
  - TypeScript types
  - Formatters (currency, numbers, dates)
  - Validators
  - Helper functions
  - Constants

- **packages/cloud-functions** - Cloud Functions handlers:
  - Property notifications
  - Market analytics
  - Email handling

## Architecture

### Service Layer

The app follows a clear separation between server and client:

#### Server Services (`/services/server/*`)
- Only called from API routes or server components
- Direct database/external API access
- Business logic

#### Client Services (`/services/client/*`)
- Called from client components
- Make fetch calls to API routes
- Handle client-side state

#### API Routes (`/app/api/*`)
- Always call server services
- Never contain business logic directly
- Return standardized `ApiResponse` format

### Example Flow

```
Client Component → Client Service → API Route → Server Service → Database/External API
```

## Landing Page Features

✅ **Hero Section**
- Gradient background with animations
- Market statistics
- Call-to-action buttons

✅ **Market Stats**
- Real-time market overview
- Average price, price per sq ft
- Total listings, days on market

✅ **Featured Properties**
- Property cards with images
- Bedroom, bathroom, sqft details
- Price and location info

✅ **Market Analysis**
- Interactive charts with Recharts
- Price trends over time
- Sales volume tracking
- Market insights

✅ **About Section**
- AI-powered features
- Real-time data highlights
- Trust indicators

✅ **Contact Form**
- Fully functional form
- Validation
- Success/error states

## Color Palette

- **Ocean Blue** (Primary): `#0ea5e9` - Professional, trustworthy
- **Turquoise** (Secondary): `#14b8a6` - Modern, fresh
- **Coral** (Accent): `#f43f5e` - Energy, premium
- **Grays**: Modern neutrals for text and backgrounds

## Development Commands

```bash
# Development
pnpm dev                 # Start all apps in dev mode
pnpm dev --filter web    # Start only web app

# Building
pnpm build               # Build all packages
pnpm build --filter web  # Build only web app

# Linting
pnpm lint                # Lint all packages

# Clean
pnpm clean               # Remove all build artifacts
```

## Project Structure

```
apps/web/src/
├── app/
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── sections/         # Page sections
│   └── ui/              # shadcn/ui components
├── services/
│   ├── server/          # Server-side services
│   └── client/          # Client-side services
└── lib/
    └── utils.ts         # Utility functions
```

## Next Steps

1. **Customize Content**: Update mock data in `services/server/properties.service.ts`
2. **Connect Database**: Replace mock data with real database queries
3. **Add Authentication**: Implement user authentication
4. **Set Up Email**: Configure email service for contact form
5. **Deploy**: Follow `DEPLOYMENT.md` to deploy to Google Cloud

## Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example apps/web/.env.local
```

## Tips

- All data is currently mocked - perfect for demo/development
- Images use Unsplash URLs - replace with your own
- Forms are functional but need backend integration
- Charts show mock trends - connect to real analytics

## Need Help?

- Check `DEPLOYMENT.md` for deployment instructions
- Review component files for implementation details
- All services are documented with JSDoc comments

---

Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and shadcn/ui
