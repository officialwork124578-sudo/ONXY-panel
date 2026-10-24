import { NextResponse } from 'next/server';
export async function POST(request: Request) {
  const { username, password } = await request.json();
  if (username === 'R4RECOVERIST' && password === 'M4mahadev@3690') {
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth_token', 'ONXY_SECURE_TOKEN_2026', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 604800, path: '/' });
    return response;
  }
  return NextResponse.json({ success: false }, { status: 401 });
}
