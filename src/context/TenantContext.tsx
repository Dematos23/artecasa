
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// For now, we will hardcode the tenant ID.
// In a real multi-tenant app, this would be determined dynamically,
// likely from the hostname or subdomain.
const HARDCODED_TENANT_ID = 'artecasa-test';

interface TenantContextType {
  tenantId: string | null;
}

const TenantContext = createContext<TenantContextType>({ tenantId: null });

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  // In a real app, you might have logic here to determine the tenantId
  const [tenantId] = useState<string | null>(HARDCODED_TENANT_ID);

  return (
    <TenantContext.Provider value={{ tenantId }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): { tenantId: string } => {
  const context = useContext(TenantContext);
  if (!context || !context.tenantId) {
    // This should not happen in the current hardcoded setup,
    // but it's good practice for when the logic becomes dynamic.
    throw new Error('useTenant must be used within a TenantProvider with a valid tenantId.');
  }
  return { tenantId: context.tenantId };
};
