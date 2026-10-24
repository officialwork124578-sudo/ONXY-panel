import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export function proxy(request: NextRequest) {
 const isAuth = request.cookies.has("auth");
 if (!isAuth && request.nextUrl.pathname === "/") return NextResponse.redirect(new URL("/login", request.url));
 if (isAuth && request.nextUrl.pathname === "/login") return NextResponse.redirect(new URL("/", request.url));
 return NextResponse.next();
}
export const config = { matcher: ["/", "/login"] };
