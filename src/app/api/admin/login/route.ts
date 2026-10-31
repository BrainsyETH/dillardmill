import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, SESSION_DAYS, checkPassword, createSessionToken } from '@/lib/admin/session';

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');
  const next = String(form.get('next') ?? '/admin');
  const safeNext = next.startsWith('/admin') ? next : '/admin';

  if (!(await checkPassword(password))) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 1000));
    const back = new URL('/admin/login', request.url);
    back.searchParams.set('error', process.env.ADMIN_PASSWORD ? '1' : 'unset');
    back.searchParams.set('next', safeNext);
    return NextResponse.redirect(back, 303);
  }

  const token = await createSessionToken();
  const res = NextResponse.redirect(new URL(safeNext, request.url), 303);
  res.cookies.set(ADMIN_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
