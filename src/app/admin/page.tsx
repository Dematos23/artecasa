import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MessageSquare, Eye } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Contacts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">+5 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Site Visits</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,402</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold font-headline mb-4">Quick Actions</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">This is where admin-related quick actions and site content management forms would go.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
