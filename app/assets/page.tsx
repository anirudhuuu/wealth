"use client";

import { AssetsList } from "@/components/assets/assets-list";
import { AssetsSkeleton } from "@/components/assets/assets-skeleton";
import { SandboxBanner } from "@/components/sandbox-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAssets } from "@/hooks/use-assets";
import { useUserWithProfile } from "@/hooks/use-user";
import { formatCurrency, roundToTwoDecimals } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function AssetsPage() {
  const { user, isLoading: userLoading, isAdmin } = useUserWithProfile();
  const { data: assets = [], isLoading: assetsLoading, error } = useAssets();

  const isLoading = userLoading || assetsLoading;

  if (isLoading) {
    return <AssetsSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings</h1>
          <p className="text-muted-foreground">
            Track your investments and savings
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">
            Failed to load assets data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings</h1>
          <p className="text-muted-foreground">
            Track your investments and savings
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Please sign in to view your savings.
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalValue = roundToTwoDecimals(
    assets.reduce((sum: number, asset) => sum + Number(asset.current_value), 0)
  );

  const totalGain = roundToTwoDecimals(
    assets.reduce(
      (sum: number, asset) =>
        sum + (Number(asset.current_value) - Number(asset.purchase_value || 0)),
      0
    )
  );

  const gainPercentage = assets.reduce((sum: number, asset) => {
    const purchaseValue = Number(asset.purchase_value);
    if (purchaseValue === 0) return sum;
    return (
      sum +
      ((Number(asset.current_value) - purchaseValue) / purchaseValue) * 100
    );
  }, 0);

  const avgGainPercentage =
    assets.length > 0 ? gainPercentage / assets.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Savings</h1>
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
            <div
              className="text-2xl font-bold truncate"
              title={formatCurrency(totalValue)}
            >
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
                <TrendingUp className="h-5 w-5 flex-shrink-0" />
              ) : (
                <TrendingDown className="h-5 w-5 flex-shrink-0" />
              )}
              <span
                className="truncate"
                title={formatCurrency(Math.abs(totalGain))}
              >
                {formatCurrency(Math.abs(totalGain))}
              </span>
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
              className={`text-2xl font-bold truncate ${
                avgGainPercentage >= 0 ? "text-green-600" : "text-amber-600"
              }`}
              title={`${
                avgGainPercentage >= 0 ? "+" : ""
              }${avgGainPercentage.toFixed(2)}%`}
            >
              {avgGainPercentage >= 0 ? "+" : ""}
              {avgGainPercentage.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings List */}
      <AssetsList assets={assets} isAdmin={isAdmin} />
    </div>
  );
}
