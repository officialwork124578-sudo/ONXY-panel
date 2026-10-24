import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  // If trying to access dashboard without token, redirect to login
  if (request.nextUrl.pathname === '/' && token !== 'ONXY_SECURE_TOKEN_2026') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access login, redirect to dashboard
  if (request.nextUrl.pathname === '/login' && token === 'ONXY_SECURE_TOKEN_2026') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login'],
};
