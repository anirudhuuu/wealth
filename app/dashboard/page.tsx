import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardData } from "@/lib/actions/dashboard-actions";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dashboardData = await getDashboardData("12m");

  return <DashboardClient user={user} dashboardData={dashboardData} />;
}
