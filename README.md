# Dillard Mill - Pine Valley Airbnb Website

A modern Next.js website for Pine Valley Airbnb vacation rentals near Dillard Mill State Historic Site in Missouri.

## Tech Stack

- **Next.js 16.1** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Styling
- **Sanity.io** - Headless CMS
- **Neon** - Serverless Postgres database (schema in `db/migrations/`, apply with `npm run db:migrate`)
- **Framer Motion** - Animations
- **Vercel** - Hosting

## Project Status

Replacing the Squarespace site at dillardmill.com. Current status and the
migration plan: [`docs/MIGRATION-AUDIT.md`](docs/MIGRATION-AUDIT.md).
Direct booking (request-to-book, Square, Airbnb iCal sync):
[`docs/BOOKING-ENGINE.md`](docs/BOOKING-ENGINE.md).

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Sanity.io account (free tier)
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

## Sanity Setup

1. Go to [sanity.io](https://www.sanity.io/) and create a project
2. Add credentials to `.env.local`
3. Visit [http://localhost:3000/studio](http://localhost:3000/studio) to manage content

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
