import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getSessionFromCookie(request: NextRequest) {
  const sessionCookie = request.cookies.get("votes_session");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);

    if (!session?.userId) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionFromCookie(request);
  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPrivateRoute = pathname === "/profile" || pathname.startsWith("/profile/");
  const isElectionDetailRoute = pathname.startsWith("/elections/") && !pathname.endsWith("/results");

  if (session) {
    if (isLoginPage || isRegisterPage) {
      const targetUrl = session.role === "admin" ? "/admin" : "/";
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    if (isHomePage && session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (isAdminArea && session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  if (isHomePage || isPrivateRoute || isAdminArea || isElectionDetailRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/profile/:path*", "/admin/:path*", "/elections/:path*"],
};
