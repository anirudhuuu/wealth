"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteAsset } from "@/hooks/use-assets";
import type { Asset } from "@/lib/types";
import { formatCurrency, parseDateFromDatabase } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Coins,
  Edit,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/use-performance";
import { AddAssetDialog } from "./add-asset-dialog";
import { EditAssetDialog } from "./edit-asset-dialog";

interface AssetsListProps {
  assets: Asset[];
}

export function AssetsList({ assets }: AssetsListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "value" | "gain" | "type">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // React Query mutations
  const deleteAssetMutation = useDeleteAsset();

  // Debounce search query to improve performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter and sort assets
  const filteredAndSortedAssets = useMemo(() => {
    let filtered = assets;

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = assets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          asset.type.toLowerCase().includes(query) ||
          (asset.notes && asset.notes.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "value":
          aValue = Number(a.current_value);
          bValue = Number(b.current_value);
          break;
        case "gain":
          aValue = Number(a.current_value) - Number(a.purchase_value);
          bValue = Number(b.current_value) - Number(b.purchase_value);
          break;
        case "type":
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [assets, debouncedSearchQuery, sortBy, sortOrder]);

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
    deleteAssetMutation.mutate(assetId, {
      onSettled: () => {
        setDeletingAssetId(null);
      },
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return parseDateFromDatabase(dateString).toLocaleDateString("en-US", {
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
            <CardTitle>Your Savings</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Sort Controls */}
          <div className="mb-6 space-y-4 lg:space-y-0">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-2">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search investments by name, type, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort Controls */}
              <div className="flex flex-row gap-2 overflow-x-auto lg:overflow-x-visible">
                {/* Sort By */}
                <Select
                  value={sortBy}
                  onValueChange={(value: "name" | "value" | "gain" | "type") =>
                    setSortBy(value)
                  }
                >
                  <SelectTrigger className="w-[120px] flex-shrink-0">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                    <SelectItem value="gain">Profit/Loss</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Order - Icon Button */}
                <Button
                  variant="outline"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="w-[40px] sm:w-[44px] h-9 flex-shrink-0 p-0"
                  title={
                    sortOrder === "asc" ? "Sort ascending" : "Sort descending"
                  }
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Results count */}
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedAssets.length} of {assets.length}{" "}
                assets
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAndSortedAssets.length === 0 ? (
              <div className="col-span-full">
                <Empty>
                  <EmptyMedia variant="icon">
                    <Coins className="h-8 w-8 opacity-50" />
                  </EmptyMedia>
                  <EmptyContent>
                    <EmptyTitle>
                      {searchQuery
                        ? `No assets found matching "${searchQuery}"`
                        : "No assets yet"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : true
                        ? "Add your first asset to start tracking your wealth"
                        : "Assets will appear here once they're added"}
                    </EmptyDescription>
                    {!searchQuery && (
                      <Button size="sm" onClick={() => setShowAddDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Asset
                      </Button>
                    )}
                  </EmptyContent>
                </Empty>
              </div>
            ) : (
              filteredAndSortedAssets.map((asset) => {
                const currentValue = Number(asset.current_value);
                const purchaseValue = Number(asset.purchase_value);
                const gain = currentValue - purchaseValue;
                const gainPercentage =
                  purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;
                const isExpanded = expandedAssets.has(asset.id);

                return (
                  <div
                    key={asset.id}
                    className="rounded-lg border p-3 md:p-4 h-fit"
                  >
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
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
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
                      <div className="text-right min-w-0 flex-shrink-0">
                        <div
                          className={`flex items-center gap-1 text-base md:text-lg font-bold ${
                            gain >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {gain >= 0 ? (
                            <TrendingUp className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <TrendingDown className="h-4 w-4 flex-shrink-0" />
                          )}
                          <span
                            className="truncate"
                            title={`${gain >= 0 ? "+" : ""}${formatCurrency(
                              Math.abs(gain)
                            )}`}
                          >
                            {gain >= 0 ? "+" : ""}
                            {formatCurrency(Math.abs(gain))}
                          </span>
                        </div>
                        <div
                          className={`text-xs md:text-sm truncate ${
                            gain >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                          title={`${
                            gain >= 0 ? "+" : ""
                          }${gainPercentage.toFixed(2)}%`}
                        >
                          {gain >= 0 ? "+" : ""}
                          {gainPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    {/* Asset type badge */}
                    <div className="flex justify-start ml-8 mb-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getAssetTypeColor(asset.type)}`}
                      >
                        {getAssetTypeLabel(asset.type)}
                      </Badge>
                    </div>
                    {/* Full width content area */}
                    <div className="w-full">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center w-full min-w-0">
                          <span className="text-muted-foreground flex-shrink-0">
                            Current Worth:
                          </span>
                          <span
                            className="font-semibold truncate ml-2"
                            title={formatCurrency(currentValue)}
                          >
                            {formatCurrency(currentValue)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full min-w-0">
                          <span className="text-muted-foreground flex-shrink-0">
                            Original Cost:
                          </span>
                          <span
                            className="font-medium truncate ml-2"
                            title={formatCurrency(purchaseValue)}
                          >
                            {formatCurrency(purchaseValue)}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-3 border-t pt-3">
                          {asset.name.length > 20 && (
                            <div className="mb-3">
                              <span className="text-sm text-muted-foreground">
                                Investment Name:
                              </span>
                              <p className="text-sm mt-1 p-2 bg-muted rounded-md break-words">
                                {asset.name}
                              </p>
                            </div>
                          )}
                          <div className="space-y-3 text-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">
                                Investment Date:
                              </span>
                              <span className="font-medium">
                                {formatDate(asset.purchase_date)}
                              </span>
                            </div>
                            {asset.maturity_date && (
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">
                                  End Date:
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
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-muted-foreground">
                                Profit/Loss:
                              </span>
                              <span
                                className={`font-medium truncate ${
                                  gain >= 0 ? "text-green-600" : "text-red-600"
                                }`}
                                title={`${gain >= 0 ? "+" : ""}${formatCurrency(
                                  Math.abs(gain)
                                )} (${gainPercentage.toFixed(2)}%)`}
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
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAsset(asset)}
                        className="h-8 w-8 p-0"
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
                          <AlertDialogFooter className="flex flex-row gap-2">
                            <AlertDialogCancel
                              disabled={deletingAssetId === asset.id}
                              className="flex-1"
                            >
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAsset(asset.id)}
                              disabled={deletingAssetId === asset.id}
                              className="bg-red-600 hover:bg-red-700 flex-1"
                            >
                              {deletingAssetId === asset.id
                                ? "Removing..."
                                : "Delete Asset"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <AddAssetDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      <EditAssetDialog
        open={!!editingAsset}
        onOpenChange={(open) => !open && setEditingAsset(null)}
        asset={editingAsset}
      />
    </>
  );
}
