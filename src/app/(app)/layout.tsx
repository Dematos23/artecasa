

export default function AppSubdomainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout is responsible for the /app subdomain routes.
    // It can have a different root structure, providers, etc.
    return <>{children}</>;
}
