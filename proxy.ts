import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  user: {
    id: string;
    email: string;
    role: string;
  };
  exp?: number;
}

function isAdmin(request: NextRequest): boolean {
  try {
    const session = request.cookies.get("session")?.value;
    if (!session) {
      return false;
    }

    const decoded = jwtDecode<DecodedToken>(session);

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return false;
    }

    // Check if user is an admin
    return decoded.user?.role === "admin";
  } catch (error) {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/api/auth/login", "/api/auth/check"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isCardRoute = pathname.includes("/card");

  // Allow public routes and card routes
  if (isPublicRoute || isCardRoute) {
    return NextResponse.next();
  }

  // Check if user is an admin for protected routes
  const isAdminUser = isAdmin(request);

  if (!isAdminUser) {
    // Redirect to login if not an admin
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
