

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export default function TenantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout is responsible for the tenant-specific pages.
    return (
        <>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
        </>
    );
}
