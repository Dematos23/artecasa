/**
 * @fileoverview Client-side utilities for resolving tenant context from the hostname.
 */

// A resolver interface to allow for different strategies (e.g., API lookup, cookie).
// This will be implemented and injected later.
export interface Resolver {
  resolve(host: string): Promise<string | null>;
}

// In a real implementation, a resolver instance would be passed here.
// For now, the logic is kept minimal as requested.
let resolver: Resolver | null = null;

export function setTenantResolver(instance: Resolver) {
  resolver = instance;
}

const PLATFORM_HOSTNAMES = ['casora.pe', 'www.casora.pe', 'app.casora.pe', 'localhost'];

/**
 * Resolves a tenant ID from a given hostname.
 * @param host The hostname from the browser window (e.g., window.location.host).
 * @returns The tenantId or null if it's a platform-level host.
 */
export async function getTenantIdFromHost(host: string): Promise<string | null> {
  if (PLATFORM_HOSTNAMES.includes(host) || host.endsWith('.casora.pe')) {
    const parts = host.split('.');
    const isPlatform = PLATFORM_HOSTNAMES.includes(host);
    
    // Handles subdomains like 'demo.casora.pe' -> tenantId: 'demo'
    // Platform domains like 'app.casora.pe' resolve to null.
    if (!isPlatform && parts.length > 2) {
      return parts[0];
    }
    
    return null; // It's a main platform URL
  }

  // For custom domains, a resolver mechanism is needed.
  if (resolver) {
    return await resolver.resolve(host);
  }

  // Fallback: If no resolver is configured, we cannot determine the tenant for a custom domain.
  console.warn(`No tenant resolver configured for custom domain: ${host}`);
  return null;
}
