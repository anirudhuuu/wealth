import { AdminSettings } from "@/components/settings/admin-settings";
import { ProfileSettings } from "@/components/settings/profile-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getProfile, requireAuth } from "@/lib/auth";
import { Shield } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);
  const isAdmin = profile?.is_admin ?? false;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Information */}
      <ProfileSettings user={user} profile={profile} />

      {/* Admin Badge */}
      {isAdmin && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Admin Access</CardTitle>
            </div>
            <CardDescription>
              You have full access to all features and data management
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Admin Settings */}
      {isAdmin && <AdminSettings />}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Email
              </div>
              <div className="mt-1 font-medium">{user.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                User ID
              </div>
              <div className="mt-1 font-mono text-sm">{user.id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Account Created
              </div>
              <div className="mt-1">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Account Type
              </div>
              <div className="mt-1">
                {isAdmin ? "Admin" : "Standard User (Sandbox Mode)"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
