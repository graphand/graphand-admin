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
  // const headers = Object.fromEntries(request.headers.entries());
  // console.log(headers);
  const referer = request.headers.get("referer") as string;
  const { pathname } = request.nextUrl;

  console.log({ referer });

  return NextResponse.next();

  const user = await getCurrentUserForMiddleware();

  try {
    const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
    const redirectUrl = new URL(
      "/auth/login?callbackUrl=" + callbackUrl,
      referer
    );
    console.log(redirectUrl?.toString());
  } catch (error) {
    console.log(error);
    const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
    console.log("/auth/login?callbackUrl=" + callbackUrl, referer);
  }

  try {
    // Check if user is trying to access a protected route without being logged in
    if (isAuthRoute(pathname) && user) {
      const redirectUrl = new URL("/", referer);
      return NextResponse.redirect(redirectUrl);
    }

    if (!isAuthRoute(pathname) && !isPublicRoute(pathname) && !user) {
      const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
      const redirectUrl = new URL(
        "/auth/login?callbackUrl=" + callbackUrl,
        referer
      );
      return NextResponse.redirect(redirectUrl);
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
