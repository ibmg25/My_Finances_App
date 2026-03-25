import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuth = request.cookies.has('fin_auth');
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  if (!isAuth && !isAuthRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuth && isAuthRoute) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude: Next.js internals, static files, favicon, and /api/* routes.
  // /api/* must be excluded so fetch calls to the backend proxy are never
  // intercepted and redirected to /login by the auth guard.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
