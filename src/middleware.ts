import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/graphand-server";
import { cookies } from "next/headers";

const isPublicRoute = (pathname: string) => {
  return pathname.startsWith("/public");
};

const isAuthRoute = (pathname: string) => {
  return pathname.startsWith("/auth");
};

const getCookieProject = async () => {
  const cookieStore = await cookies();
  const project = cookieStore.get("NEXT_GRAPHAND_PROJECT");
  return project?.value;
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
  const { pathname } = request.nextUrl;
  const { headers } = request;

  const proto = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || request.headers.get("host");
  const baseUrl = proto + "://" + host;

  // Normalize path by removing scope if already present
  const segments = pathname.split("/");
  let cleanPath: string;

  if (segments[1].startsWith("$")) {
    cleanPath = "/" + segments.slice(2).join("/");
  } else {
    cleanPath = pathname;
  }

  if (!isPublicRoute(cleanPath)) {
    // Check auth status
    const user = await getCurrentUserForMiddleware();

    // Handle auth redirects
    if (user && isAuthRoute(cleanPath)) {
      const redirectUrl = new URL("/", baseUrl);
      return NextResponse.redirect(redirectUrl);
    }

    if (!user && !isAuthRoute(cleanPath)) {
      let redirectUrl: URL;
      if (cleanPath !== "/") {
        redirectUrl = new URL("/auth/login", baseUrl);
      } else {
        const callbackUrl = encodeURIComponent(cleanPath);
        redirectUrl = new URL(
          "/auth/login?callbackUrl=" + callbackUrl,
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
    const url = new URL(cleanPath, baseUrl);
    // Preserve the search params
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  } else if (segments[1] !== scope) {
    const url = new URL(`/${scope}${cleanPath}`, baseUrl);
    // Preserve the search params
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
