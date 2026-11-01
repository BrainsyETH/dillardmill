import { neon, neonConfig } from "@neondatabase/serverless";
export type Database = ReturnType<typeof neon<false, false>>;
let connection: Database | undefined;
function getConnection(): Database {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured.");
  // Local development only: send queries to a local Neon-compatible HTTP
  // proxy (e.g. local-neon-http-proxy) instead of Neon's hosted endpoint.
  if (process.env.NEON_FETCH_ENDPOINT && process.env.NODE_ENV !== "production") {
    neonConfig.fetchEndpoint = process.env.NEON_FETCH_ENDPOINT;
  }
  return (connection ??= neon(process.env.DATABASE_URL));
}
// Importing public pages must not open a connection or require a credential.
export const sql = new Proxy(function () {} as unknown as Database, {
  apply(_target, _this, args) {
    return Reflect.apply(getConnection(), undefined, args);
  },
  get(_target, key) {
    const client = getConnection();
    const value = Reflect.get(client, key);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as Database;
