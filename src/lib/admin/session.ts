// Owner admin session: an HMAC-signed, expiring cookie that records who
// signed in — a Google Workspace address from ADMIN_EMAILS, or "password"
// for the shared ADMIN_PASSWORD fallback. Web Crypto only, so it runs in
// the proxy as well as in route handlers and server actions.

export const ADMIN_COOKIE = 'pv_admin';
export const SESSION_DAYS = 14;
const PASSWORD_IDENTITY = 'password';

export interface AdminSession {
  /** Workspace email, or "password" for the shared-password login. */
  identity: string;
  expires: number;
}

const encoder = new TextEncoder();

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  return s && s.length >= 12 ? s : null;
}

/** Lowercased Workspace addresses allowed into /admin. */
export function allowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function passwordLoginEnabled(): boolean {
  const p = process.env.ADMIN_PASSWORD;
  return Boolean(p && p.length >= 12);
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

const b64 = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));

/** Identity still allowed? Revoking an email or the password ends sessions at once. */
function stillAllowed(identity: string): boolean {
  if (identity === PASSWORD_IDENTITY) return passwordLoginEnabled();
  return allowedAdminEmails().includes(identity);
}

export async function createSessionToken(
  identity: string = PASSWORD_IDENTITY,
  now = Date.now(),
): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const who = identity.toLowerCase();
  const expires = String(now + SESSION_DAYS * 86400_000);
  return `${expires}.${b64(who)}.${await hmac(`admin:${expires}:${who}`, key)}`;
}

export async function readSession(token: string | undefined, now = Date.now()): Promise<AdminSession | null> {
  const key = secret();
  if (!key || !token) return null;
  const [expires, who64, sig] = token.split('.');
  if (!expires || !who64 || !sig || Number(expires) < now) return null;
  let identity: string;
  try {
    identity = unb64(who64);
  } catch {
    return null;
  }
  if (!constantTimeEqual(sig, await hmac(`admin:${expires}:${identity}`, key))) return null;
  if (!stillAllowed(identity)) return null;
  return { identity, expires: Number(expires) };
}

export async function verifySessionToken(token: string | undefined, now = Date.now()): Promise<boolean> {
  return (await readSession(token, now)) !== null;
}

/** Compare a submitted password without leaking length or content via timing. */
export async function checkPassword(submitted: string): Promise<boolean> {
  if (!passwordLoginEnabled()) return false;
  const key = 'pv-password-compare';
  return constantTimeEqual(await hmac(submitted, key), await hmac(process.env.ADMIN_PASSWORD!, key));
}
