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
    await client.init();
    const token = client.options.accessToken;
    console.log("token", token);
    return await client.me();
  } catch (e) {
    // @ts-expect-error iouoiio
    if ("res" in e) {
      // @ts-expect-error iouoiio
      console.log(e.res?.status);
      // @ts-expect-error iouoiio
      console.log(e.message);
    }

    console.error(e);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { headers } = request;

  const proto = headers.get("x-forwarded-proto");
  const host = headers.get("x-forwarded-host");
  const baseUrl = proto + "://" + host;

  const user = await getCurrentUserForMiddleware();

  // Check if user is trying to access a protected route without being logged in
  if (isAuthRoute(pathname) && user) {
    const redirectUrl = new URL("/", baseUrl);
    return NextResponse.redirect(redirectUrl);
  }

  if (!isAuthRoute(pathname) && !isPublicRoute(pathname) && !user) {
    let redirectUrl: URL;
    if (request.nextUrl.pathname !== "/") {
      redirectUrl = new URL("/auth/login", baseUrl);
    } else {
      const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
      redirectUrl = new URL("/auth/login?callbackUrl=" + callbackUrl, baseUrl);
    }

    return NextResponse.redirect(redirectUrl);
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
