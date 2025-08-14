
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In a real app, this would be a list of hostnames that are NOT tenant-specific.
const PLATFORM_HOSTNAMES = ['casora.pe', 'www.casora.pe', 'app.casora.pe', 'localhost'];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || url.hostname;

  // Prevent rewriting for static assets
  if (url.pathname.startsWith('/_next') || url.pathname.includes('.')) {
    return NextResponse.next();
  }
  
  const isPlatformHostname = PLATFORM_HOSTNAMES.find(h => hostname.startsWith(h));

  // For subdomains like 'demo.casora.pe' or 'demo.localhost:9002'
  const tenantId = hostname.split('.')[0];
  
  if (!isPlatformHostname && tenantId && tenantId !== 'localhost') {
    // This is a tenant-specific subdomain.
    // We set the header and let the request continue to the (public) pages.
    request.headers.set('x-tenant-id', tenantId);
    return NextResponse.next();
  }

  // Otherwise, it's a platform route
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
       */
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
  }
