#!/usr/bin/env node
// Apply db/migrations/*.sql to the Neon database in DATABASE_URL, in order,
// recording each in schema_migrations. Each file runs in one transaction.
//
//   DATABASE_URL=... npm run db:migrate            # apply pending
//   DATABASE_URL=... npm run db:migrate -- --dry   # list pending only

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool, neonConfig } from '@neondatabase/serverless';
import 'dotenv/config';

neonConfig.webSocketConstructor = globalThis.WebSocket;

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'db', 'migrations');
const dry = process.argv.includes('--dry');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())`);
  const { rows } = await client.query('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) console.log('No pending migrations.');
  for (const file of pending) {
    if (dry) {
      console.log(`pending: ${file}`);
      continue;
    }
    const body = await readFile(path.join(dir, file), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(body);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`applied: ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`failed: ${file}\n${err.message}`);
      process.exitCode = 1;
      break;
    }
  }
} finally {
  client.release();
  await pool.end();
}
