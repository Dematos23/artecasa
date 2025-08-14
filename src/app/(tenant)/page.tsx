
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { TenantHomepage } from './TenantHomepage';

export default function TenantRootPage() {
    const headersList = headers();
    const tenantId = headersList.get('x-tenant-id');

    if (!tenantId) {
        // This case should ideally be handled by middleware, 
        // but as a safeguard, we prevent rendering without a tenant.
        notFound();
    }

    return <TenantHomepage tenantId={tenantId} />;
}
