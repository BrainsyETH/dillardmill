# Dillard Mill - Pine Valley Airbnb Website

A modern Next.js website for Pine Valley Airbnb vacation rentals near Dillard Mill State Historic Site in Missouri.

## Tech Stack

- **Next.js 16.1** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Styling
- **Sanity.io** - Headless CMS
- **Neon** - Serverless Postgres database (3 GB free tier)
- **Framer Motion** - Animations
- **Vercel** - Hosting

## Project Status

Currently in **Phase 1: Foundation & Migration Prep**

### Completed
- ✅ Next.js project initialized
- ✅ Sanity CMS schemas created
- ✅ Supabase client setup
- ✅ Base layout components (Header, Footer, Navigation)
- ✅ Directory structure established
- ✅ TypeScript types defined
- ✅ Utility functions created

### Next Steps (Phase 2)
- Set up Sanity Studio with actual project credentials
- Configure Supabase database tables
- Export content from Squarespace
- Migrate listing data to Sanity

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Sanity.io account (free tier)
- A Supabase account (free tier)

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:

Copy \`.env.example\` to \`.env.local\` and fill in your credentials.

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Sanity Setup

1. Go to [sanity.io](https://www.sanity.io/) and create a project
2. Add credentials to \`.env.local\`
3. Visit [http://localhost:3000/studio](http://localhost:3000/studio) to manage content

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL in the implementation plan to create tables
3. Add credentials to \`.env.local\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm run lint\` - Run ESLint

## License

Private project for Pine Valley Airbnb.
