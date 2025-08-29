"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Monitor, Moon, Sun, RotateCcw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettingsStore, Theme } from "@/state/settings.store";
import { useAuthStore } from "@/state/auth.store";
import { getERPAdapter, listAvailableAdapters } from "@/erps/adapters";
import { toast } from "@/lib/toast";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  role: z.string().min(1, "Role is required"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { theme, profile, loadSettings, setTheme, updateProfile, resetDemoData } = useSettingsStore();
  const { session } = useAuthStore();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    form.reset(profile);
  }, [profile, form]);

  const onSubmit = (data: ProfileForm) => {
    updateProfile(data);
    toast.success("Profile updated successfully");
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all demo data? This will clear all projects, suppliers, and settings.")) {
      resetDemoData();
    }
  };

  const currentAdapter = getERPAdapter();
  const availableAdapters = listAvailableAdapters();

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  {...form.register("name")}
                  placeholder="Your full name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...form.register("email")}
                  type="email"
                  placeholder="your@email.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  {...form.register("role")}
                  placeholder="Your role"
                />
                {form.formState.errors.role && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full">
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={theme === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleThemeChange(option.value)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Current system status and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Application Version</span>
                <span className="text-sm font-medium">1.0.0-MVP</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current User</span>
                <span className="text-sm font-medium">{session?.user.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active Adapter</span>
                <span className="text-sm font-medium">{currentAdapter.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Environment</span>
                <span className="text-sm font-medium">Demo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ERP Adapters */}
        <Card>
          <CardHeader>
            <CardTitle>ERP Adapters</CardTitle>
            <CardDescription>
              Available ERP integration adapters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableAdapters.map((adapter) => (
                <div key={adapter.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{adapter.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{adapter.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      adapter.configured ? "bg-green-500" : "bg-yellow-500"
                    }`} />
                    <span className="text-xs text-muted-foreground">
                      {adapter.configured ? "Configured" : "Not configured"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demo Data Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Demo Data Management</CardTitle>
            <CardDescription>
              Reset or manage your demo data for testing purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="text-sm font-medium">Reset Demo Data</h4>
                  <p className="text-sm text-muted-foreground">
                    This will clear all projects, suppliers, activities, and settings
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleResetData}>
                Reset All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}






