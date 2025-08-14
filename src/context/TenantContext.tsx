
"use client";

import React, { createContext, useContext, ReactNode } from 'react';

interface TenantContextType {
  tenantId: string | null;
}

const TenantContext = createContext<TenantContextType>({ tenantId: null });

/**
 * A simple provider that takes a tenantId and makes it available to its children.
 * It no longer contains logic to resolve the tenant itself.
 */
export const TenantProvider = ({
  children,
  tenantId,
}: {
  children: ReactNode;
  tenantId: string | null;
}) => {
  return (
    <TenantContext.Provider value={{ tenantId }}>
      {children}
    </TenantContext.Provider>
  );
};

// Hook for components that need to know the current tenant.
export const useTenant = (): { tenantId: string | null; isRoot: boolean } => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return {
    tenantId: context.tenantId,
    isRoot: context.tenantId === null,
  };
};

// Hook for components that REQUIRE a tenantId to function.
export const useRequiredTenant = (): { tenantId: string } => {
    const { tenantId } = useTenant();
    if (!tenantId) {
      // This hook is for components that should not render outside a tenant context.
      // It can throw an error or you can handle it by returning a loading/error state.
      throw new Error('This component requires a tenant context and tenantId is missing.');
    }
    return { tenantId };
}
