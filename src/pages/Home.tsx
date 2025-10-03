import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, Sparkles, Camera, FileText } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import { z } from "zod";

const manualItemSchema = z.object({
  name: z.string().trim().min(1, { message: "Item name is required" }).max(200, { message: "Name too long" }),
  description: z.string().trim().max(1000, { message: "Description too long" }).optional(),
  category: z.string().trim().max(100, { message: "Category too long" }).optional(),
  estimated_value: z.number().min(0, { message: "Value must be positive" }).max(1000000, { message: "Value too high" }).optional(),
  room_location: z.string().trim().max(100, { message: "Location too long" }).optional(),
  condition: z.string().min(1, { message: "Condition is required" }),
});

const Home = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [showAnalyzeButton, setShowAnalyzeButton] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'uploading' | 'analyzing' | 'saving' | null>(null);
  const [manualEntry, setManualEntry] = useState({
    name: "",
    description: "",
    category: "",
    estimated_value: "",
    room_location: "",
    condition: "good",
  });

  const handleFileUpload = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setAnalysisStep('uploading');
    const imageUrls: string[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload photos",
          variant: "destructive",
        });
        return;
      }

      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('item-photos')
          .upload(filePath, file);

        if (uploadError) {
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('item-photos')
          .getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      if (imageUrls.length > 0) {
        setUploadedUrls(imageUrls);
        setShowAnalyzeButton(true);
        toast({
          title: "Success",
          description: `${imageUrls.length} photo(s) uploaded. Ready to analyze!`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setAnalysisStep(null);
    }
  };

  const handleAnalyzeImages = async () => {
    if (uploadedUrls.length === 0) return;

    setAnalyzing(true);
    setAnalysisStep('analyzing');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      setAnalysisStep('saving');

      const { data, error } = await supabase.functions.invoke('analyze-items', {
        body: { imageUrls: uploadedUrls },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success!",
        description: `Analyzed and saved ${data.items.length} item(s)`,
      });

      setUploadedUrls([]);
      setShowAnalyzeButton(false);
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze images",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
      setAnalysisStep(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate input
      const result = manualItemSchema.safeParse({
        name: manualEntry.name,
        description: manualEntry.description || undefined,
        category: manualEntry.category || undefined,
        estimated_value: manualEntry.estimated_value ? parseFloat(manualEntry.estimated_value) : undefined,
        room_location: manualEntry.room_location || undefined,
        condition: manualEntry.condition,
      });

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: result.error.errors[0].message,
        });
        return;
      }

      setLoading(true);

      const { error } = await supabase.from("inventory_items").insert({
        user_id: user.id,
        name: result.data.name,
        description: result.data.description || null,
        category: result.data.category || null,
        estimated_value: result.data.estimated_value || null,
        room_location: result.data.room_location || null,
        condition: result.data.condition,
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
            <CardContent className="flex flex-col items-center justify-center py-12">
              {!showAnalyzeButton && !analyzing && (
                <>
                  <div className="mb-8 text-center">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground mb-2">
                      Drag & drop images here or choose from your device
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports JPG, PNG, WebP • Max 10MB per file
                    </p>
                  </div>
                  
                  <div className="flex gap-4 mb-6">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Select Images
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Camera className="w-4 h-4" />
                      Take Photos
                    </Button>
                  </div>

                  {files.length > 0 && !uploading && (
                    <div className="w-full">
                      <p className="text-sm text-muted-foreground mb-4">
                        {files.length} file(s) selected
                      </p>
                      <Button
                        onClick={() => handleFileUpload(files)}
                        className="w-full"
                      >
                        Upload Photos
                      </Button>
                    </div>
                  )}

                  {uploading && (
                    <div className="w-full text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Uploading images...</p>
                    </div>
                  )}
                </>
              )}

              {showAnalyzeButton && !analyzing && (
                <div className="w-full space-y-4">
                  <div className="text-center mb-6">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Analyze ({uploadedUrls.length} images)</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI will analyze your photos with precision
                    </p>
                  </div>
                  <Button
                    onClick={handleAnalyzeImages}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Wake Up The AI Librarian
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAnalyzeButton(false);
                      setUploadedUrls([]);
                      setFiles([]);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {analyzing && (
                <div className="w-full max-w-md">
                  <div className="bg-card border rounded-lg p-6 space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Processing Your Items</h3>
                      <p className="text-sm text-muted-foreground">
                        Our AI is analyzing your photos...
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        analysisStep === 'uploading' ? 'bg-primary/10' : 'bg-muted/50'
                      }`}>
                        <Upload className="w-5 h-5" />
                        <span className="text-sm font-medium">Uploading Images</span>
                      </div>

                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        analysisStep === 'analyzing' ? 'bg-primary/10' : 'bg-muted/50'
                      }`}>
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-medium">AI Analysis</span>
                      </div>

                      <div className={`flex items-center gap-3 p-3 rounded-lg ${
                        analysisStep === 'saving' ? 'bg-primary/10' : 'bg-muted/50'
                      }`}>
                        <FileText className="w-5 h-5" />
                        <span className="text-sm font-medium">Saving Items</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles(Array.from(e.target.files));
                  }
                }}
              />
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