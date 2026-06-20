import { NextResponse, type NextRequest } from 'next/server';

interface SessionResponse {
  success: boolean;
}

const privateRoutes = ['/notes', '/profile'];
const publicRoutes = ['/sign-in', '/sign-up'];

const isPrivateRoute = (pathname: string): boolean => {
  return privateRoutes.some(route => pathname.startsWith(route));
};

const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some(route => pathname.startsWith(route));
};

const checkAuth = async (request: NextRequest): Promise<boolean> => {
  try {
    const response = await fetch(new URL('/api/auth/session', request.url), {
      headers: {
        Cookie: request.headers.get('cookie') ?? '',
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as SessionResponse;

    return data.success;
  } catch {
    return false;
  }
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivate = isPrivateRoute(pathname);
  const isPublic = isPublicRoute(pathname);

  if (!isPrivate && !isPublic) {
    return NextResponse.next();
  }

  const isAuthenticated = await checkAuth(request);

  if (isPrivate && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublic && isAuthenticated) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};