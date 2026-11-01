# Dillard Mill - Pine Valley Airbnb Website

A modern Next.js website for Pine Valley Airbnb vacation rentals near Dillard Mill State Historic Site in Missouri.

## Tech Stack

- **Next.js 16.1** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Styling
- **Neon** - Postgres for stays, prices, bookings and calendars (schema in `db/migrations/`, apply with `npm run db:migrate`); edited in `/admin`
- **Square** - Card holds and payments
- **Resend** - Booking email; owner mail stays on Google Workspace
- **Framer Motion** - Animations
- **Vercel (Pro)** - Hosting

## Project Status

Replacing the Squarespace site at dillardmill.com.

- How booking, calendars, admin and setup work: [`docs/BOOKING-ENGINE.md`](docs/BOOKING-ENGINE.md)
- Guest-facing design and imported content: [`docs/GUEST-EXPERIENCE.md`](docs/GUEST-EXPERIENCE.md)
- Decisions and launch status: [`docs/MIGRATION-AUDIT.md`](docs/MIGRATION-AUDIT.md)

Content (descriptions, photos, journal posts) lives in `src/lib/content/` and
`public/images/`. Business data (stays, prices, taxes, policies) is edited in
`/admin`.

## Getting Started

### Prerequisites

- Node.js 20+ installed
- A Neon Postgres database
- A Square account (sandbox for testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your credentials.

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Database Setup

1. Create a Neon project and put its connection string in `DATABASE_URL`
2. Run `npm run db:migrate` (idempotent; applies `db/migrations/*.sql`)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript check
- `npm test` - Unit and booking-lifecycle tests (Vitest + PGlite)
- `npm run db:migrate` - Apply database migrations to `DATABASE_URL`

## License

Private project for Pine Valley Airbnb.
