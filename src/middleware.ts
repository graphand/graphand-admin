import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/graphand-server";

const isPublicRoute = (pathname: string) => {
  return (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  );
};

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get("auth_token");
  const { pathname } = request.nextUrl;

  const client = await createServerClient();
  const me = await client.me();

  // Check if user is trying to access a protected route without being logged in
  if (isPublicRoute(pathname)) {
    if (me) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (!me) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
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
