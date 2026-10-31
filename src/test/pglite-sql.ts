// Test double for the Neon `sql` tagged-template client, backed by PGlite
// (real Postgres compiled to WASM) so constraints and SQL are exercised for real.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';

interface Query {
  text: string;
  values: unknown[];
}

export async function createTestDb() {
  const db = new PGlite({ extensions: { btree_gist } });
  const migration = readFileSync(
    path.join(__dirname, '..', '..', 'db', 'migrations', '001_booking_engine.sql'),
    'utf8',
  );
  await db.exec(migration);

  const run = async (q: Query) => (await db.query(q.text, q.values)).rows as Record<string, unknown>[];

  function sql(strings: TemplateStringsArray, ...values: unknown[]) {
    const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''), '');
    const query: Query = { text, values };
    // Lazy like Neon's NeonQueryPromise: runs only when awaited.
    return Object.assign(query, {
      then<T>(resolve: (rows: Record<string, unknown>[]) => T, reject?: (e: unknown) => T) {
        return run(query).then(resolve, reject);
      },
    });
  }
  sql.transaction = async (queries: Query[]) => {
    await db.exec('BEGIN');
    try {
      const out = [];
      for (const q of queries) out.push(await run(q));
      await db.exec('COMMIT');
      return out;
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
  };

  return { db, sql };
}
