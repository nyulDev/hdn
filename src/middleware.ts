import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route yang hanya bisa diakses oleh super_admin
const SUPER_ADMIN_ONLY_ROUTES = ['/user-management'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get('auth_session');
  const userRole = request.cookies.get('user_role')?.value;

  // Jika user sudah login dan mencoba mengakses halaman signin atau root /, arahkan ke dashboard
  if (sessionCookie && (pathname === '/signin' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Izinkan akses ke halaman signin
  if (pathname.startsWith('/signin')) {
    return NextResponse.next();
  }

  if (!sessionCookie) {
    // Redirect ke signin jika belum login
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // Cek akses ke route khusus super_admin
  const isProtectedRoute = SUPER_ADMIN_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && userRole !== 'super_admin') {
    // Redirect ke dashboard dengan pesan tidak diizinkan
    return NextResponse.redirect(new URL('/dashboard?unauthorized=true', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi route mana saja yang harus melewati middleware ini
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - images, dll.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
