import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("__session")?.value;
    const role = request.cookies.get("__role")?.value;

    // No session → send to login
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Only editor, admin, super_admin can access admin panel
    if (!role || !["editor", "admin", "super_admin"].includes(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Editors cannot access user management
    if (role === "editor" && pathname.startsWith("/admin/users")) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // Only super_admin can access user management
    if (
      role === "admin" &&
      pathname.startsWith("/admin/users")
    ) {
      // Admins can view users but cannot change roles (enforced server-side)
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
