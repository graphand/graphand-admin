import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/graphand-server";
import { getCookieProject } from "./lib/server";

const isAppRoute = (pathname: string) => {
  return pathname.startsWith("/app");
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
  const client = await createServerClient();
  await client.init();
  return await client.me();
}

export async function middleware(request: NextRequest) {
  const { headers } = request;

  const proto = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || request.headers.get("host");
  const baseUrl = proto + "://" + host;
  const nextUrl = new URL(request.nextUrl, baseUrl);

  // Normalize path by removing scope if already present
  const segments = nextUrl.pathname.split("/");
  let cleanNextUrl: URL;

  if (segments[1].startsWith("$")) {
    cleanNextUrl = new URL("/" + segments.slice(2).join("/"), baseUrl);
    cleanNextUrl.search = nextUrl.search;
  } else {
    cleanNextUrl = nextUrl;
  }

  if (!isAppRoute(cleanNextUrl.pathname)) {
    // Check auth status
    const user = await getCurrentUserForMiddleware();

    // Handle auth redirects
    if (user && isAuthRoute(cleanNextUrl.pathname)) {
      const redirectUrl = new URL("/", baseUrl);
      return NextResponse.redirect(redirectUrl);
    }

    if (!user && !isAuthRoute(cleanNextUrl.pathname)) {
      let redirectUrl: URL;
      if (cleanNextUrl.pathname === "/") {
        redirectUrl = new URL("/auth/login", baseUrl);
      } else {
        const next = cleanNextUrl.toString().replace(baseUrl, "");
        redirectUrl = new URL(
          "/auth/login?next=" + encodeURIComponent(next),
          baseUrl
        );
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  // After auth check, determine and apply the correct scope
  const project = await getCookieProject();
  const scope = project ? "$project" : "$global";

  // Only rewrite if not already on the correct scope path
  if (segments[1].startsWith("$")) {
    // return NextResponse.redirect(cleanNextUrl);
  } else if (segments[1] !== scope) {
    const url = new URL(`/${scope}${cleanNextUrl.pathname}`, baseUrl);
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
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
