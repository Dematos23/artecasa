
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PLATFORM_HOSTNAMES = ['casora.pe', 'www.casora.pe', 'app.casora.pe', 'localhost'];

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || url.hostname;

  // Prevent rewriting for static assets, API routes, etc.
  if (url.pathname.startsWith('/_next') || url.pathname.startsWith('/api') || url.pathname.includes('.')) {
    return NextResponse.next();
  }
  
  const isPlatformHostname = PLATFORM_HOSTNAMES.find(h => hostname.startsWith(h));

  // Handle the admin panel subdomain
  if (hostname.startsWith('app.')) {
      url.pathname = `/app${url.pathname}`
      return NextResponse.rewrite(url);
  }

  // Handle root domains for the main portal
  if (isPlatformHostname) {
    return NextResponse.next();
  }

  // Handle tenant subdomains
  const tenantId = hostname.split('.')[0];
  
  // Set the tenantId in the request headers
  request.headers.set('x-tenant-id', tenantId);

  // Rewrite to the (tenant) group
  url.pathname = `/tenant${url.pathname}`;
  
  return NextResponse.rewrite(url, {
    request: {
      headers: request.headers,
    }
  });
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
