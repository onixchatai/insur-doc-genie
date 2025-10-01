import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            Admin Dashboard
          </CardTitle>
          <CardDescription>
            Dashboard features coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will display overview statistics, recent activity, and quick actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;