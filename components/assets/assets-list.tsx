"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Asset } from "@/lib/types";
import {
  ChevronDown,
  ChevronRight,
  Coins,
  Edit,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AddAssetDialog } from "./add-asset-dialog";
import { EditAssetDialog } from "./edit-asset-dialog";

interface AssetsListProps {
  assets: Asset[];
  isAdmin: boolean;
}

export function AssetsList({ assets, isAdmin }: AssetsListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const router = useRouter();

  const toggleAssetExpansion = (assetId: string) => {
    setExpandedAssets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const handleDeleteAsset = async (assetId: string) => {
    setDeletingAssetId(assetId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", assetId);

      if (error) throw error;

      router.refresh();
      toast.success("Asset deleted successfully");
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Failed to delete asset. Please try again.");
    } finally {
      setDeletingAssetId(null);
    }
  };

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
                const isExpanded = expandedAssets.has(asset.id);

                return (
                  <div key={asset.id} className="rounded-lg border p-3 md:p-4">
                    {/* Header with chevron, name, and gain/loss */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAssetExpansion(asset.id)}
                          className="h-6 w-6 p-0 hover:bg-transparent flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <h3 className="font-semibold">
                          {asset.name.length > 20 ? (
                            <>
                              {asset.name.substring(0, 20)}...
                              <span className="text-xs text-muted-foreground ml-1">
                                ({asset.name.length} chars)
                              </span>
                            </>
                          ) : (
                            asset.name
                          )}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div
                          className={`flex items-center gap-1 text-base md:text-lg font-bold ${
                            gain >= 0 ? "text-green-600" : "text-amber-600"
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
                          className={`text-xs md:text-sm ${
                            gain >= 0 ? "text-green-600" : "text-amber-600"
                          }`}
                        >
                          {gain >= 0 ? "+" : ""}
                          {gainPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Asset type pill */}
                    <div className="flex justify-start ml-8 mb-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getAssetTypeColor(
                          asset.type
                        )}`}
                      >
                        {getAssetTypeLabel(asset.type)}
                      </span>
                    </div>

                    {/* Full width content area */}
                    <div className="w-full">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-muted-foreground">
                            Current Value:
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(currentValue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-muted-foreground">
                            Purchase Value:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(purchaseValue)}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-3 border-t pt-3">
                          {asset.name.length > 20 && (
                            <div className="mb-3">
                              <span className="text-sm text-muted-foreground">
                                Asset Name:
                              </span>
                              <p className="text-sm mt-1 p-2 bg-muted rounded-md break-words">
                                {asset.name}
                              </p>
                            </div>
                          )}
                          <div className="space-y-3 text-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">
                                Purchase Date:
                              </span>
                              <span className="font-medium">
                                {formatDate(asset.purchase_date)}
                              </span>
                            </div>
                            {asset.maturity_date && (
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">
                                  Maturity Date:
                                </span>
                                <span className="font-medium">
                                  {formatDate(asset.maturity_date)}
                                </span>
                              </div>
                            )}
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">
                                Type:
                              </span>
                              <span className="font-medium">
                                {getAssetTypeLabel(asset.type)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">
                                Gain/Loss:
                              </span>
                              <span
                                className={`font-medium ${
                                  gain >= 0
                                    ? "text-green-600"
                                    : "text-amber-600"
                                }`}
                              >
                                {gain >= 0 ? "+" : ""}
                                {formatCurrency(Math.abs(gain))} (
                                {gainPercentage.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                          {asset.notes && (
                            <div className="mt-2">
                              <span className="text-sm text-muted-foreground">
                                Notes:
                              </span>
                              <p className="text-sm mt-1 p-2 bg-muted rounded-md break-words">
                                {asset.notes.length > 100 ? (
                                  <>
                                    {asset.notes.substring(0, 100)}...
                                    <span className="text-xs text-muted-foreground ml-1">
                                      ({asset.notes.length} chars)
                                    </span>
                                  </>
                                ) : (
                                  asset.notes
                                )}
                              </p>
                              {asset.notes.length > 100 && (
                                <div className="mt-2">
                                  <span className="text-sm text-muted-foreground">
                                    Full Notes:
                                  </span>
                                  <p className="text-sm mt-1 p-2 bg-muted rounded-md break-words">
                                    {asset.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons at bottom */}
                    {isAdmin && (
                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAsset(asset)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit asset"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete asset"
                              disabled={deletingAssetId === asset.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Asset</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{asset.name}"?
                                This will permanently delete the asset.
                                <br />
                                <br />
                                <strong>This action cannot be undone.</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel
                                disabled={deletingAssetId === asset.id}
                              >
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAsset(asset.id)}
                                disabled={deletingAssetId === asset.id}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deletingAssetId === asset.id
                                  ? "Deleting..."
                                  : "Delete Asset"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
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

      {isAdmin && (
        <EditAssetDialog
          open={!!editingAsset}
          onOpenChange={(open) => !open && setEditingAsset(null)}
          asset={editingAsset}
        />
      )}
    </>
  );
}
