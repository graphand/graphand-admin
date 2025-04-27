import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/graphand-server";

const isPublicRoute = (pathname: string) => {
  return (
    pathname.startsWith("/public") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api")
  );
};

const isAuthRoute = (pathname: string) => {
  return pathname.startsWith("/auth");
};

/**
 * Get the current user for middleware context
 * Note: We can't use the getMe function directly in middleware
 * as it might rely on React features not available in Edge runtime
 */
async function getCurrentUserForMiddleware() {
  try {
    const client = await createServerClient();
    return await client.me();
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const user = await getCurrentUserForMiddleware();

  // Check if user is trying to access a protected route without being logged in
  if (isAuthRoute(pathname) && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isAuthRoute(pathname) && !isPublicRoute(pathname) && !user) {
    return NextResponse.redirect(
      new URL(
        "/auth/login?callbackUrl=" +
          encodeURIComponent(request.nextUrl.toString()),
        request.url
      )
    );
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
