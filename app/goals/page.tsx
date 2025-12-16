import { GoalsClient } from "@/components/goals/goals-client";
import { getGoals } from "@/lib/actions/goal-actions";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function GoalsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const goals = await getGoals();

  return <GoalsClient user={user} goals={goals} />;
}
