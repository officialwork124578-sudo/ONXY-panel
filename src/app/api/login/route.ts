import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body;

        // Case-insensitive check + trims extra spaces
        const isUserValid = username?.trim().toUpperCase() === 'R4RECOVERIST';
        const isPassValid = password === 'M4mahadev@3690';

        if (isUserValid && isPassValid) {
            return NextResponse.json({ success: true }, { status: 200 });
        }
        
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 });
    }
}
