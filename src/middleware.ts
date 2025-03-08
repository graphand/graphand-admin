import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "./lib/graphand-server";

// Define public paths that don't require authentication
const publicPaths = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  // Skip middleware for public assets
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if the path is public
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith("/auth")
  );

  // Try to get the user
  try {
    const client = await createServerClient();
    const user = await client.me();

    // If we're on a public path but already logged in, redirect to dashboard
    if (isPublicPath && user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Allow access to protected routes when authenticated
    return NextResponse.next();
  } catch (error) {
    // Not authenticated

    // If trying to access a protected route, redirect to login
    if (!isPublicPath) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow access to public routes
    return NextResponse.next();
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
