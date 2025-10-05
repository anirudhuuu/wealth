"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Asset } from "@/lib/types";
import { Coins, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { AddAssetDialog } from "./add-asset-dialog";

interface AssetsListProps {
  assets: Asset[];
  isAdmin: boolean;
}

export function AssetsList({ assets, isAdmin }: AssetsListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAssetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fd: "Fixed Deposit",
      mutual_fund: "Mutual Fund",
      stock: "Stock",
      gold: "Gold",
      real_estate: "Real Estate",
      crypto: "Cryptocurrency",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getAssetTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      fd: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      mutual_fund:
        "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      stock:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
      gold: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
      real_estate:
        "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
      crypto: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
      other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    };
    return colors[type] || colors.other;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Assets</CardTitle>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assets.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Coins className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No assets yet</p>
                {isAdmin && (
                  <p className="mt-1">
                    Add your first asset to start tracking your wealth
                  </p>
                )}
              </div>
            ) : (
              assets.map((asset) => {
                const currentValue = Number(asset.current_value);
                const purchaseValue = Number(asset.purchase_value);
                const gain = currentValue - purchaseValue;
                const gainPercentage =
                  purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

                return (
                  <div key={asset.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{asset.name}</h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getAssetTypeColor(
                              asset.type
                            )}`}
                          >
                            {getAssetTypeLabel(asset.type)}
                          </span>
                        </div>

                        <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                          <div>
                            <span className="text-muted-foreground">
                              Current Value:
                            </span>
                            <span className="ml-2 font-semibold">
                              {formatCurrency(currentValue)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Purchase Value:
                            </span>
                            <span className="ml-2 font-medium">
                              {formatCurrency(purchaseValue)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Purchase Date:
                            </span>
                            <span className="ml-2">
                              {formatDate(asset.purchase_date)}
                            </span>
                          </div>
                          {asset.maturity_date && (
                            <div>
                              <span className="text-muted-foreground">
                                Maturity Date:
                              </span>
                              <span className="ml-2">
                                {formatDate(asset.maturity_date)}
                              </span>
                            </div>
                          )}
                        </div>

                        {asset.notes && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {asset.notes}
                          </p>
                        )}
                      </div>

                      <div className="ml-4 text-right">
                        <div
                          className={`flex items-center gap-1 text-lg font-bold ${
                            gain >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {gain >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {gain >= 0 ? "+" : ""}
                          {formatCurrency(Math.abs(gain))}
                        </div>
                        <div
                          className={`text-sm ${
                            gain >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {gain >= 0 ? "+" : ""}
                          {gainPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <AddAssetDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      )}
    </>
  );
}
