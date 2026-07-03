import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a static file request (next-intl matcher doesn't always ignore these if manually invoked or configured loosely)
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  // Intercept legacy URLs: /guide/ab12cd34ef56gh78ij90
  const pathnameWithoutLocale = pathname.replace(/^\/(en|bn)/, '');
  const isGuideLegacyPath = pathnameWithoutLocale.startsWith('/guide/') || pathname.startsWith('/guide/');

  if (isGuideLegacyPath) {
    const segments = (pathnameWithoutLocale || pathname).split('/');
    const slug = segments[2]; // /guide/xxx -> slug = xxx
    
    // Simple heuristic: Old Firestore IDs are usually 20 chars long alphanumeric
    if (slug && slug.length === 20 && /^[a-zA-Z0-9]+$/.test(slug)) {
      try {
        const redirectRes = await fetch(`${request.nextUrl.origin}/api/guide/redirect?id=${slug}`, {
          next: { revalidate: 3600 }
        });
        
        if (redirectRes.ok) {
          const data = await redirectRes.json();
          if (data.redirectUrl) {
            const trailing = segments.slice(3).join('/');
            const newUrl = `/guide/${data.redirectUrl}${trailing ? `/${trailing}` : ''}`;
            const prefix = pathname.match(/^\/(en|bn)/) ? pathname.match(/^\/(en|bn)/)![0] : '';
            return NextResponse.redirect(new URL(prefix + newUrl, request.url), 301);
          }
        }
      } catch (error) {
        console.error('Redirect check failed:', error);
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames and legacy paths
  // Ignore _next/ and static files
  matcher: ['/', '/(bn|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
