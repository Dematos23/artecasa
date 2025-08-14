
"use client";

import React, { createContext, useContext, ReactNode } from 'react';

interface TenantContextType {
  tenantId: string | null;
  isPlatformScope: boolean; // True if on a platform domain (e.g., casora.pe)
}

const TenantContext = createContext<TenantContextType>({ tenantId: null, isPlatformScope: true });

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  // In a Server Component, we could use `headers()` to get the tenantId.
  // Since this is a client context, we'll keep the logic simple for now and enhance later
  // if we need to pass server-resolved data down.
  // For this implementation, we will rely on client-side resolution.
  const [tenantInfo, setTenantInfo] = React.useState<TenantContextType>({ tenantId: "artecasa-test", isPlatformScope: false });

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
