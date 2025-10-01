import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Home = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    name: "",
    description: "",
    category: "",
    estimated_value: "",
    room_location: "",
    condition: "good",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      toast({
        title: "AI Analysis Coming Soon",
        description: "Image upload and AI analysis will be available soon!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("inventory_items").insert({
        user_id: user.id,
        name: manualEntry.name,
        description: manualEntry.description,
        category: manualEntry.category,
        estimated_value: manualEntry.estimated_value ? parseFloat(manualEntry.estimated_value) : null,
        room_location: manualEntry.room_location,
        condition: manualEntry.condition,
      });

      if (error) throw error;

      toast({
        title: "Item Added",
        description: "Your inventory item has been added successfully.",
      });

      setManualEntry({
        name: "",
        description: "",
        category: "",
        estimated_value: "",
        room_location: "",
        condition: "good",
      });
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

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="relative h-[300px] overflow-hidden">
        <img
          src={heroImage}
          alt="Smart Onix Platform"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Professional Insurance Claim Documentation
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              AI-powered inventory management for insurance professionals
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* AI Upload Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                AI-Powered Upload
              </CardTitle>
              <CardDescription>
                Upload photos and let AI analyze and categorize your items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drop images here or click to browse
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button asChild disabled={loading}>
                    <span>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Select Images"
                      )}
                    </span>
                  </Button>
                </Label>
              </div>
              <div className="mt-6 space-y-2">
                <h4 className="font-medium">How it works:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Upload photos of your items</li>
                  <li>AI analyzes and identifies items</li>
                  <li>Automatic categorization and valuation</li>
                  <li>Review and edit as needed</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Manual Entry Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
              <CardDescription>
                Add items to your inventory manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={manualEntry.name}
                    onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={manualEntry.description}
                    onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={manualEntry.category}
                      onChange={(e) => setManualEntry({ ...manualEntry, category: e.target.value })}
                      placeholder="e.g., Electronics"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="value">Estimated Value</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      value={manualEntry.estimated_value}
                      onChange={(e) => setManualEntry({ ...manualEntry, estimated_value: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Location</Label>
                    <Input
                      id="room"
                      value={manualEntry.room_location}
                      onChange={(e) => setManualEntry({ ...manualEntry, room_location: e.target.value })}
                      placeholder="e.g., Living Room"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={manualEntry.condition}
                      onValueChange={(value) => setManualEntry({ ...manualEntry, condition: value })}
                    >
                      <SelectTrigger id="condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Item...
                    </>
                  ) : (
                    "Add to Inventory"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;