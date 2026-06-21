import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept legacy URLs: /guide/ab12cd34ef56gh78ij90
  if (pathname.startsWith('/guide/')) {
    const slug = pathname.split('/')[2]; // /guide/xxx -> slug = xxx
    
    // Simple heuristic: Old Firestore IDs are usually 20 chars long alphanumeric
    if (slug && slug.length === 20 && /^[a-zA-Z0-9]+$/.test(slug)) {
      try {
        // Query our redirect endpoint
        // In a production app, you might use Edge Config, Redis, or a very fast API endpoint
        const redirectRes = await fetch(`${request.nextUrl.origin}/api/guide/redirect?id=${slug}`, {
          next: { revalidate: 3600 } // Cache this response
        });
        
        if (redirectRes.ok) {
          const data = await redirectRes.json();
          if (data.redirectUrl) {
            // Include any trailing segments in the redirect
            // If original was /guide/ab12cd34ef56gh78ij90/mcq
            // the new one will be /guide/new-slug/mcq
            const trailing = pathname.split('/').slice(3).join('/');
            const newUrl = `/guide/${data.redirectUrl}${trailing ? `/${trailing}` : ''}`;
            return NextResponse.redirect(new URL(newUrl, request.url), 301);
          }
        }
      } catch (error) {
        // If the redirect fetch fails, just continue as normal
        console.error('Redirect check failed:', error);
      }
    }
  }

  return NextResponse.next();
}

// Ensure middleware only runs for specific paths
export const config = {
  matcher: [
    '/guide/:path*',
  ]
};
