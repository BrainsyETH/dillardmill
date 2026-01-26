// Database client using Neon (serverless Postgres)
// Free tier: 3 GB storage, 5 projects - very generous!

import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);
export type Database = ReturnType<typeof neon>;

// Alternative: Use Sanity for everything (see DATABASE-SETUP.md)
