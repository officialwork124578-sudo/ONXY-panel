import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    // Case insensitive check
    if (username?.trim().toUpperCase() === 'R4RECOVERIST' && password === 'M4mahadev@3690') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('auth_token', 'ONXY_SECURE_TOKEN_2026', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    }
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
  }
}
