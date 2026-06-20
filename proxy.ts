import { NextResponse, type NextRequest } from 'next/server';
import { checkSession } from '@/lib/api/serverApi';

const privateRoutes = ['/notes', '/profile'];
const publicRoutes = ['/sign-in', '/sign-up'];

const isPrivateRoute = (pathname: string): boolean => {
  return privateRoutes.some(route => pathname.startsWith(route));
};

const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some(route => pathname.startsWith(route));
};

const applySetCookie = (
  response: NextResponse,
  setCookieHeader: string | string[] | undefined
): NextResponse => {
  if (!setCookieHeader) {
    return response;
  }

  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];

  cookies.forEach(cookie => {
    response.headers.append('Set-Cookie', cookie);
  });

  return response;
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivate = isPrivateRoute(pathname);
  const isPublic = isPublicRoute(pathname);

  if (!isPrivate && !isPublic) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (accessToken) {
    if (isPublic) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  }

  if (refreshToken) {
    try {
      const sessionResponse = await checkSession(
        request.headers.get('cookie') ?? ''
      );

      const setCookieHeader = sessionResponse.headers['set-cookie'];
      const isSessionValid = sessionResponse.data.success;

      if (isSessionValid) {
        if (isPublic) {
          const redirectResponse = NextResponse.redirect(
            new URL('/', request.url)
          );

          return applySetCookie(redirectResponse, setCookieHeader);
        }

        const nextResponse = NextResponse.next();

        return applySetCookie(nextResponse, setCookieHeader);
      }
    } catch {
      if (isPrivate) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  if (isPrivate) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};