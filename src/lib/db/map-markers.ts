import { sql } from './client';
import { mapUnits as defaultMarkers } from '@/lib/map/map-units';
import type { MapUnit } from '@/lib/map/map-units';

const CONFIG_KEY = 'map_markers';

export async function ensureSiteConfigTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );
  `;
}

export async function getMapMarkers(): Promise<MapUnit[]> {
  try {
    await ensureSiteConfigTable();
    const rows = await sql`
      SELECT value FROM site_config WHERE key = ${CONFIG_KEY} LIMIT 1
    `;
    if (rows.length > 0 && rows[0].value) {
      return rows[0].value as MapUnit[];
    }
  } catch (error) {
    console.error('Failed to load map markers from DB:', error);
  }
  return defaultMarkers;
}

export async function saveMapMarkers(markers: MapUnit[]): Promise<void> {
  await ensureSiteConfigTable();
  await sql`
    INSERT INTO site_config (key, value, updated_at)
    VALUES (${CONFIG_KEY}, ${JSON.stringify(markers)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = NOW()
  `;
}
