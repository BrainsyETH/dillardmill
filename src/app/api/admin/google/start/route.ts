import { NextRequest, NextResponse } from 'next/server';
import { OAUTH_COOKIE, authorizationUrl, googleSignInEnabled } from '@/lib/admin/google';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!googleSignInEnabled()) return NextResponse.redirect(new URL('/admin/login?error=google-off', request.url));
  const next = request.nextUrl.searchParams.get('next') ?? '/admin';
  const safeNext = next.startsWith('/admin') ? next : '/admin';
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();
  const res = NextResponse.redirect(authorizationUrl({ origin: request.nextUrl.origin, state, nonce }));
  // Short-lived, httpOnly; SameSite=Lax so it comes back on Google's redirect.
  res.cookies.set(OAUTH_COOKIE, JSON.stringify({ state, nonce, next: safeNext }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/admin/google',
    maxAge: 600,
  });
  return res;
}
