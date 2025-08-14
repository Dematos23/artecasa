
"use client";

import { usePathname } from 'next/navigation';
import { TenantProvider } from '@/context/TenantContext';
import React, { useState, useEffect } from 'react';

/**
 * This client component is responsible for resolving the tenantId based on the
 * current path and providing it to the TenantContext. It wraps the parts
 * of the application that need to be tenant-aware.
 */
export function TenantResolver({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // This logic runs on the client to determine the tenant.
  useEffect(() => {
    // In a real app with server-side header injection, you might read
    // the tenant from a cookie set by the server or an initial data script.
    // For this setup, we derive it from the path for the `(tenant)` routes
    // and a hardcoded value for the `(app)` routes.
    
    // This logic is a placeholder for a more robust multi-tenant strategy.
    // A better approach involves the middleware setting a cookie or header
    // that this component can read reliably.
    if (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/(tenant)')) {
       // This is a simplified example. A production app would have a more robust
       // way to determine the tenantId for admin/login, perhaps from user session.
       setTenantId('artecasa-test'); 
    } else {
       // This is the root domain (casora.pe), so no tenant is active.
       setTenantId(null);
    }
    setLoading(false);
  }, [pathname]);

  if (loading) {
      return null; // Or a loading spinner
  }

  return <TenantProvider tenantId={tenantId}>{children}</TenantProvider>;
}
