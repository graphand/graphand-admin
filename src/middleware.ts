import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token");
  const { pathname } = request.nextUrl;

  // Check if user is trying to access a protected route without being logged in
  if (
    !authToken &&
    !PUBLIC_ROUTES.includes(pathname) &&
    !pathname.startsWith("/_next")
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check if user is trying to access login/register while already logged in
  if (authToken && PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
