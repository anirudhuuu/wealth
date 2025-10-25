import { SettingsClient } from "@/components/settings/settings-client";
import { getProfile } from "@/lib/actions/user-actions";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const profile = await getProfile();

  return <SettingsClient user={user} profile={profile} />;
}
