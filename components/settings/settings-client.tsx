"use client";

import { ProfileSettings } from "@/components/settings/profile-settings";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Profile } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

interface SettingsClientProps {
  user: User;
  profile: Profile;
}

export function SettingsClient({ user, profile }: SettingsClientProps) {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Summary</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* Profile Information */}
      <div>
        <ProfileSettings
          user={user}
          profile={{
            display_name: profile.display_name,
          }}
        />
      </div>
    </div>
  );
}
