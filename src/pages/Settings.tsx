import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building } from "lucide-react";
import { z } from "zod";

const companySettingsSchema = z.object({
  company_name: z.string().trim().max(200, { message: "Company name too long" }).optional(),
  company_address: z.string().trim().max(500, { message: "Address too long" }).optional(),
  license_number: z.string().trim().max(100, { message: "License number too long" }).optional(),
  iicrc_certification_number: z.string().trim().max(100, { message: "Certification number too long" }).optional(),
});

const Settings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    company_name: "",
    company_address: "",
    license_number: "",
    iicrc_certification_number: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          company_name: data.company_name || "",
          company_address: data.company_address || "",
          license_number: data.license_number || "",
          iicrc_certification_number: data.iicrc_certification_number || "",
        });
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate input
      const result = companySettingsSchema.safeParse({
        company_name: profile.company_name || undefined,
        company_address: profile.company_address || undefined,
        license_number: profile.license_number || undefined,
        iicrc_certification_number: profile.iicrc_certification_number || undefined,
      });

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: result.error.errors[0].message,
        });
        return;
      }

      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: result.data.company_name || null,
          company_address: result.data.company_address || null,
          license_number: result.data.license_number || null,
          iicrc_certification_number: result.data.iicrc_certification_number || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your company settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Company Settings</h1>
        <p className="text-muted-foreground">Manage your company information and branding</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>
            This information will appear on generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                placeholder="Your Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_address">Company Address</Label>
              <Textarea
                id="company_address"
                value={profile.company_address}
                onChange={(e) => setProfile({ ...profile, company_address: e.target.value })}
                placeholder="123 Main St, City, State ZIP"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  value={profile.license_number}
                  onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                  placeholder="LIC-12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iicrc_certification">IICRC Certification Number</Label>
                <Input
                  id="iicrc_certification"
                  value={profile.iicrc_certification_number}
                  onChange={(e) => setProfile({ ...profile, iicrc_certification_number: e.target.value })}
                  placeholder="IICRC-12345"
                />
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;