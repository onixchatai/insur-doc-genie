import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  Briefcase,
  LogOut,
  Menu,
  X,
  Upload,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { User, Session } from "@supabase/supabase-js";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for existing session and set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session && location.pathname !== "/auth") {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session && location.pathname !== "/auth") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  useEffect(() => {
    // Check if user is admin
    if (user) {
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single()
        .then(({ data }) => {
          setIsAdmin(!!data);
        });
    }
  }, [user]);

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/auth");
    }
  };

  if (!user) {
    return null;
  }

  const navItems = [
    { icon: Upload, label: "Upload & Scan", path: "/" },
    { icon: Package, label: "My Inventory", path: "/inventory" },
    { icon: FileText, label: "Reports", path: "/reports" },
  ];

  const adminItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Briefcase, label: "Jobs", path: "/jobs" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Smart Onix
              </h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
              {isAdmin && adminItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
              <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
              {isAdmin && adminItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                onClick={toggleDarkMode}
                className="w-full justify-start gap-2"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;