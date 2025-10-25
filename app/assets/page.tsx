import { AssetsClient } from "@/components/assets/assets-client";
import { getAssets } from "@/lib/actions/asset-actions";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AssetsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const assets = await getAssets();

  return <AssetsClient user={user} assets={assets} />;
}
