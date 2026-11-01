import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSessionToken, readSession, verifySessionToken } from './session';
import { checkIdTokenClaims, decodeIdToken } from './google';

afterEach(() => vi.unstubAllEnvs());

describe('admin sessions', () => {
  it('records a Google Workspace identity and rejects tampering', async () => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'a-long-random-session-secret');
    vi.stubEnv('ADMIN_EMAILS', 'Owner@DillardMill.com, helper@dillardmill.com');
    const token = (await createSessionToken('owner@dillardmill.com'))!;
    expect(await readSession(token)).toMatchObject({ identity: 'owner@dillardmill.com' });

    const [exp, who, sig] = token.split('.');
    const forged = `${exp}.${Buffer.from('intruder@gmail.com').toString('base64url')}.${sig}`;
    expect(await verifySessionToken(forged)).toBe(false);
    expect(await verifySessionToken(`${Number(exp) + 1}.${who}.${sig}`)).toBe(false);
  });

  it('ends a session as soon as the address is removed from ADMIN_EMAILS', async () => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'a-long-random-session-secret');
    vi.stubEnv('ADMIN_EMAILS', 'helper@dillardmill.com');
    const token = (await createSessionToken('helper@dillardmill.com'))!;
    expect(await verifySessionToken(token)).toBe(true);
    vi.stubEnv('ADMIN_EMAILS', 'owner@dillardmill.com');
    expect(await verifySessionToken(token)).toBe(false);
  });

  it('ends password sessions when the shared password is removed', async () => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'a-long-random-session-secret');
    vi.stubEnv('ADMIN_PASSWORD', 'shared-password-123');
    const token = (await createSessionToken())!;
    expect(await verifySessionToken(token)).toBe(true);
    vi.stubEnv('ADMIN_PASSWORD', '');
    expect(await verifySessionToken(token)).toBe(false);
  });

  it('expires', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'shared-password-123');
    const token = (await createSessionToken('password', Date.now() - 15 * 86400_000))!;
    expect(await verifySessionToken(token)).toBe(false);
  });
});

describe('Google ID token checks', () => {
  const now = Date.UTC(2026, 10, 1);
  const good = {
    iss: 'https://accounts.google.com',
    aud: 'client-123.apps.googleusercontent.com',
    exp: now / 1000 + 300,
    nonce: 'n-1',
    email: 'Owner@DillardMill.com',
    email_verified: true,
  };
  const expected = {
    clientId: 'client-123.apps.googleusercontent.com',
    nonce: 'n-1',
    allowed: ['owner@dillardmill.com'],
    now,
  };

  it('accepts an allowed, verified Workspace address', () => {
    expect(checkIdTokenClaims(good, expected)).toEqual({ ok: true, email: 'owner@dillardmill.com' });
  });

  it.each([
    [{ iss: 'https://evil.example' }, 'wrong issuer'],
    [{ aud: 'someone-else' }, 'wrong audience'],
    [{ exp: now / 1000 - 1 }, 'expired'],
    [{ nonce: 'replayed' }, 'nonce mismatch'],
    [{ email_verified: false }, 'email not verified'],
    [{ email: 'stranger@gmail.com' }, 'not an admin'],
  ])('rejects %j', (override, reason) => {
    expect(checkIdTokenClaims({ ...good, ...override }, expected)).toEqual({ ok: false, reason });
  });

  it('decodes the token payload', () => {
    const payload = Buffer.from(JSON.stringify(good)).toString('base64url');
    expect(decodeIdToken(`h.${payload}.s`)).toMatchObject({ email: good.email });
  });
});
