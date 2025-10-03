import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Mail, Loader2 } from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  estimated_value: number | null;
  color: string | null;
  image_url: string | null;
  category: string | null;
  condition: string | null;
  room_location: string | null;
}

const Reports = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("inventory_items")
        .select("id, name, description, estimated_value, color, image_url, category, condition, room_location")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItems(data || []);
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

  const totalValue = items.reduce((sum, item) => sum + (item.estimated_value || 0), 0);

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

      <div className="grid gap-8">
        {/* Report Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Total Items</p>
                <p className="text-3xl font-bold mt-2">{items.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Total Value</p>
                <p className="text-3xl font-bold mt-2">${totalValue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button
                className="w-full"
                onClick={handleGenerateReport}
                disabled={generating || items.length === 0}
                size="sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>All items that will be included in the report</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No items to display. Add items to generate a report.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded flex items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {item.estimated_value !== null && (
                          <div>
                            <span className="text-muted-foreground">Value:</span>{" "}
                            <span className="font-medium">${item.estimated_value.toLocaleString()}</span>
                          </div>
                        )}
                        {item.color && (
                          <div>
                            <span className="text-muted-foreground">Color:</span>{" "}
                            <span className="font-medium">{item.color}</span>
                          </div>
                        )}
                        {item.category && (
                          <div>
                            <span className="text-muted-foreground">Category:</span>{" "}
                            <span className="font-medium">{item.category}</span>
                          </div>
                        )}
                        {item.condition && (
                          <div>
                            <span className="text-muted-foreground">Condition:</span>{" "}
                            <span className="font-medium capitalize">{item.condition}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;