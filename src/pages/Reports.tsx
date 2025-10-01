import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Mail, Loader2 } from "lucide-react";

const Reports = () => {
  const { toast } = useToast();
  const [itemCount, setItemCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("inventory_items")
        .select("estimated_value")
        .eq("user_id", user.id);

      if (error) throw error;

      setItemCount(data.length);
      setTotalValue(data.reduce((sum, item) => sum + (item.estimated_value || 0), 0));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      toast({
        title: "Report Generation Coming Soon",
        description: "PDF generation feature will be available soon!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleEmailReport = async () => {
    toast({
      title: "Email Feature Coming Soon",
      description: "Email automation will be available soon!",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Reports</h1>
        <p className="text-muted-foreground">Create professional insurance claim documentation</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Report Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
            <CardDescription>Current inventory statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">Total Items</span>
              <span className="text-2xl font-bold">{itemCount}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">Total Value</span>
              <span className="text-2xl font-bold">${totalValue.toLocaleString()}</span>
            </div>
            <div className="pt-4 space-y-2">
              <Button
                className="w-full"
                onClick={handleGenerateReport}
                disabled={generating || itemCount === 0}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate PDF Report
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleEmailReport}
                disabled={itemCount === 0}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Features */}
        <Card>
          <CardHeader>
            <CardTitle>Report Features</CardTitle>
            <CardDescription>What's included in your reports</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">Complete Inventory List</p>
                  <p className="text-sm text-muted-foreground">
                    All items with detailed descriptions and values
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">Professional Formatting</p>
                  <p className="text-sm text-muted-foreground">
                    Insurance-ready document layout
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">Company Branding</p>
                  <p className="text-sm text-muted-foreground">
                    Your company logo and information
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">Image Documentation</p>
                  <p className="text-sm text-muted-foreground">
                    All item photos included in report
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;