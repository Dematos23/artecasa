
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// In a real app, this would be a list of hostnames that are NOT tenant-specific.
const PLATFORM_HOSTNAMES = ['casora.pe', 'www.casora.pe', 'app.casora.pe', 'localhost'];

interface TenantContextType {
  tenantId: string | null;
  isPlatformScope: boolean; // True if on a platform domain (e.g., casora.pe)
}

const TenantContext = createContext<TenantContextType>({ tenantId: null, isPlatformScope: true });

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenantInfo, setTenantInfo] = useState<TenantContextType>({ tenantId: null, isPlatformScope: true });

  useEffect(() => {
    // This effect runs on the client side to determine the tenant context.
    const hostname = window.location.hostname;
    
    if (PLATFORM_HOSTNAMES.includes(hostname) || hostname.endsWith('.casora.pe')) {
        // Simple logic for subdomains like 'demo.casora.pe' -> tenantId: 'demo'
        const parts = hostname.split('.');
        const isPlatform = PLATFORM_HOSTNAMES.includes(hostname);

        const newTenantId = !isPlatform && parts.length > 2 ? parts[0] : null;

        setTenantInfo({
            tenantId: newTenantId,
            isPlatformScope: !newTenantId,
        });
    } else {
        // In a real app, you'd look up the custom domain in your 'domains' collection
        // For now, we'll treat unknown domains as platform scope.
        console.log(`Custom domain ${hostname} needs to be resolved.`);
        setTenantInfo({
            tenantId: null, // Should be looked up
            isPlatformScope: true, // Or false if it resolves to a tenant
        });
    }
  }, []);

  return (
    <TenantContext.Provider value={tenantInfo}>
      {children}
    </TenantContext.Provider>
  );
};

// Hook for components that need to know if they are in a tenant context.
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider.');
  }
  return context;
};

// Hook for components that REQUIRE a tenantId to function.
export const useRequiredTenant = (): { tenantId: string } => {
    const context = useContext(TenantContext);
    if (!context || !context.tenantId) {
      // This hook is for components that should not render outside a tenant context.
      // It can throw an error or you can handle it by returning a loading/error state.
      throw new Error('This component requires a tenant context.');
    }
    return { tenantId: context.tenantId };
}
