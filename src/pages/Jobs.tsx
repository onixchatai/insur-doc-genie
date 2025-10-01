import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

const Jobs = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Jobs</h1>
        <p className="text-muted-foreground">Manage client jobs and assignments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Management
          </CardTitle>
          <CardDescription>
            Job management features coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will allow you to create, track, and manage insurance claim jobs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Jobs;