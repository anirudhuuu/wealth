import { AssetsList } from "@/components/assets/assets-list";
import { SandboxBanner } from "@/components/sandbox-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile, requireAuth } from "@/lib/auth";
import { generateSandboxAssets } from "@/lib/sandbox";
import { createClient } from "@/lib/supabase/server";
import { TrendingDown, TrendingUp } from "lucide-react";

export default async function AssetsPage() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);
  const isAdmin = profile?.is_admin ?? false;

  let assets = [];
  let totalValue = 0;
  let totalGain = 0;

  if (isAdmin) {
    const supabase = await createClient();

    const { data: assetData } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    assets = assetData || [];
  } else {
    assets = generateSandboxAssets();
  }

  // Calculate totals
  totalValue = assets.reduce(
    (sum, asset) => sum + Number(asset.current_value),
    0
  );
  totalGain = assets.reduce(
    (sum, asset) =>
      sum + (Number(asset.current_value) - Number(asset.purchase_value)),
    0
  );

  const gainPercentage = assets.reduce((sum, asset) => {
    const purchaseValue = Number(asset.purchase_value);
    if (purchaseValue === 0) return sum;
    return (
      sum +
      ((Number(asset.current_value) - purchaseValue) / purchaseValue) * 100
    );
  }, 0);

  const avgGainPercentage =
    assets.length > 0 ? gainPercentage / assets.length : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
        <p className="text-muted-foreground">
          Track your investments and wealth
        </p>
      </div>

      {!isAdmin && <SandboxBanner />}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gain/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`flex items-center gap-2 text-2xl font-bold ${
                totalGain >= 0 ? "text-green-600" : "text-amber-600"
              }`}
            >
              {totalGain >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {formatCurrency(Math.abs(totalGain))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                avgGainPercentage >= 0 ? "text-green-600" : "text-amber-600"
              }`}
            >
              {avgGainPercentage >= 0 ? "+" : ""}
              {avgGainPercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets List */}
      <AssetsList assets={assets} isAdmin={isAdmin} />
    </div>
  );
}
