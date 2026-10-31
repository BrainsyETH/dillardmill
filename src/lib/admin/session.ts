// Owner admin session: a single shared password (ADMIN_PASSWORD) exchanged
// for an HMAC-signed, expiring cookie. Web Crypto only, so it runs in the
// proxy as well as in route handlers.

export const ADMIN_COOKIE = 'pv_admin';
export const SESSION_DAYS = 14;

const encoder = new TextEncoder();

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  return s && s.length >= 12 ? s : null;
}

async function hmac(value: string, key: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(now = Date.now()): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const expires = String(now + SESSION_DAYS * 86400_000);
  return `${expires}.${await hmac(`admin:${expires}`, key)}`;
}

export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  const key = secret();
  if (!key || !token) return false;
  const [expires, sig] = token.split('.');
  if (!expires || !sig || Number(expires) < now) return false;
  return constantTimeEqual(sig, await hmac(`admin:${expires}`, key));
}

/** Compare a submitted password without leaking length or content via timing. */
export async function checkPassword(submitted: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 12) return false;
  const key = 'pv-password-compare';
  return constantTimeEqual(await hmac(submitted, key), await hmac(expected, key));
}
