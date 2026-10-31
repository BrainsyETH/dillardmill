import { NextRequest, NextResponse } from 'next/server';

/**
 * CSRF guard for admin mutations. The session cookie is SameSite=Lax, and
 * we additionally require a JSON body and a same-origin Origin header, which
 * a cross-site form or image request cannot produce.
 */
export function rejectCrossSite(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const sameOrigin = origin && host && new URL(origin).host === host;
  const isJson = request.headers.get('content-type')?.includes('application/json');
  if (!sameOrigin || !isJson) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}
