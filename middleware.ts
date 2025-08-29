import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the path starts with /(app) routes (dashboard, projects, suppliers, etc.)
  const { pathname } = request.nextUrl;
  
  // Define protected paths
  const protectedPaths = [
    "/dashboard",
    "/projects", 
    "/suppliers",
    "/po",
    "/analytics",
    "/approvals",
    "/settings",
    "/supplier-portal",
    "/connector-playground"
  ];

  // Check if current path needs protection
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // Check for auth cookie
    const authCookie = request.cookies.get("synqchain_auth");
    
    if (!authCookie || authCookie.value !== "1") {
      // Redirect to login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
