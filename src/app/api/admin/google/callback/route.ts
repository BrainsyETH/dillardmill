import { NextRequest, NextResponse } from 'next/server';
import {
  OAUTH_COOKIE,
  checkIdTokenClaims,
  decodeIdToken,
  exchangeCode,
  googleSignInEnabled,
} from '@/lib/admin/google';
import { ADMIN_COOKIE, SESSION_DAYS, allowedAdminEmails, createSessionToken } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

function fail(request: NextRequest, reason: string) {
  console.warn('Google admin sign-in refused:', reason);
  const res = NextResponse.redirect(new URL('/admin/login?error=google', request.url), 303);
  res.cookies.delete({ name: OAUTH_COOKIE, path: '/api/admin/google' });
  return res;
}

export async function GET(request: NextRequest) {
  if (!googleSignInEnabled()) return fail(request, 'not configured');
  const params = request.nextUrl.searchParams;
  let saved: { state?: string; nonce?: string; next?: string } = {};
  try {
    saved = JSON.parse(request.cookies.get(OAUTH_COOKIE)?.value ?? '{}');
  } catch {
    return fail(request, 'bad state cookie');
  }
  const code = params.get('code');
  if (!code || !saved.state || params.get('state') !== saved.state || !saved.nonce) {
    return fail(request, 'state mismatch');
  }

  let claims: Record<string, unknown>;
  try {
    claims = decodeIdToken(await exchangeCode(code, request.nextUrl.origin));
  } catch (error) {
    return fail(request, error instanceof Error ? error.message : 'token exchange failed');
  }
  const check = checkIdTokenClaims(claims, {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    nonce: saved.nonce,
    allowed: allowedAdminEmails(),
  });
  if (!check.ok) return fail(request, check.reason);

  const token = await createSessionToken(check.email);
  if (!token) return fail(request, 'ADMIN_SESSION_SECRET is not set');
  const next = saved.next?.startsWith('/admin') ? saved.next : '/admin';
  const res = NextResponse.redirect(new URL(next, request.url), 303);
  res.cookies.delete({ name: OAUTH_COOKIE, path: '/api/admin/google' });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  });
  return res;
}
