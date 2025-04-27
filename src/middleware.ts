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
  const host = request.headers.get("host") as string;
  const { pathname } = request.nextUrl;

  const headers = Object.fromEntries(request.headers.entries());
  console.log(headers);

  const user = await getCurrentUserForMiddleware();

  try {
    // Check if user is trying to access a protected route without being logged in
    if (isAuthRoute(pathname) && user) {
      const callbackUrl = new URL("/", host);
      return NextResponse.redirect(callbackUrl);
    }

    if (!isAuthRoute(pathname) && !isPublicRoute(pathname) && !user) {
      const callbackUrl = new URL(
        encodeURIComponent(request.nextUrl.pathname),
        host
      );
      return NextResponse.redirect("/auth/login?callbackUrl=" + callbackUrl);
    }
  } catch (error) {
    console.log(error);
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
