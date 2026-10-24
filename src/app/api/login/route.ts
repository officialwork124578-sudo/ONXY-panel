import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Hardcoded Master Credentials
    if (username === 'R4RECOVERIST' && password === 'M4mahadev@3690') {
      const response = NextResponse.json({ success: true, message: "Login successful" });
      
      // Set a simple cookie for session
      response.cookies.set('auth_token', 'super_secret_mdm_token_123', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      
      return response;
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
