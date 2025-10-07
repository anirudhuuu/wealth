import { ProfileSettings } from "@/components/settings/profile-settings";
import { getProfile, requireAuth } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);

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
    </div>
  );
}
