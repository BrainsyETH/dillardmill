// Migration 003 must not strand records created before stays moved to Postgres.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";

const dir = path.join(__dirname, "..", "..", "..", "db", "migrations");
const migration = (f: string) => readFileSync(path.join(dir, f), "utf8");

async function preUnitsDb() {
  const db = new PGlite({ extensions: { btree_gist } });
  await db.exec(migration("001_booking_engine.sql"));
  await db.exec(migration("002_guest_experience.sql"));
  return db;
}
const booking = (
  db: PGlite,
  unitId: string,
  slug: string | null,
  code: string,
) =>
  db.query(
    `INSERT INTO bookings (guest_name, guest_email, unit_id, unit_slug, unit_name, check_in, check_out,
       num_guests, num_nights, base_price, cleaning_fee, total_amount, booking_status, confirmation_code)
     VALUES ('a', 'a@x', $1, $2, 'U', '2099-12-10', '2099-12-12', 2, 2, 1, 1, 1, 'confirmed', $3)`,
    [unitId, slug, code],
  );

describe("migration 003", () => {
  it("re-points Sanity-era bookings, owner blocks and imported rows by web address", async () => {
    const db = await preUnitsDb();
    await booking(db, "sanity-abc", "cozy-cottage", "PV-OLD00001");
    await db.query(
      `INSERT INTO calendar_blocks (unit_id, start_date, end_date) VALUES ('sanity-abc', '2099-12-20', '2099-12-22')`,
    );
    await db.query(
      `INSERT INTO external_bookings (unit_id, check_in, check_out, source) VALUES ('sanity-abc', '2099-12-24', '2099-12-26', 'airbnb')`,
    );
    await db.exec(migration("003_property_data.sql"));
    const { rows } = await db.query(
      `SELECT (SELECT unit_id FROM bookings) AS b, (SELECT unit_id FROM calendar_blocks) AS k, (SELECT unit_id FROM external_bookings) AS e`,
    );
    expect(rows[0]).toEqual({
      b: "cozy-cottage",
      k: "cozy-cottage",
      e: "cozy-cottage",
    });
  });

  it("stops, changing nothing, when a record cannot be mapped", async () => {
    const db = await preUnitsDb();
    await booking(db, "sanity-unknown", null, "PV-OLD00002");
    await db.exec("BEGIN");
    await expect(db.exec(migration("003_property_data.sql"))).rejects.toThrow(
      /Migration 003 stopped: 1 booking/,
    );
    await db.exec("ROLLBACK");
    const { rows } = await db.query(
      `SELECT to_regclass('units') AS t, (SELECT unit_id FROM bookings) AS b`,
    );
    expect(rows[0]).toEqual({ t: null, b: "sanity-unknown" });
  });
});
