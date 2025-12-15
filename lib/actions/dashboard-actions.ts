"use server";

import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Asset, Transaction } from "@/lib/types";
import { formatDateForDatabase, roundToTwoDecimals } from "@/lib/utils";

export interface DashboardKPIs {
  kpis: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    totalAssets: number;
    savingsRate: number;
    totalAssetValue: number;
    totalProfit: number;
    avgReturnPercentage: number;
  };
  transactions: Transaction[];
  categoryData: Record<string, number>;
  timeRange: string;
}

export async function getDashboardData(
  timeRange: string = "12m"
): Promise<DashboardKPIs> {
  const user = await requireAuth();
  const supabase = await createClient();

  // Calculate date range based on timeRange
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "3m":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 3,
        now.getDate()
      );
      break;
    case "6m":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 6,
        now.getDate()
      );
      break;
    case "12m":
      startDate = new Date(
        now.getFullYear(),
        now.getMonth() - 12,
        now.getDate()
      );
      break;
    default:
      startDate = new Date(0); // All time
  }

  // Fetch transactions with date filter
  const { data: transactions, error: txnError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", formatDateForDatabase(startDate))
    .order("date", { ascending: false });

  if (txnError) {
    throw new Error(`Failed to fetch transactions: ${txnError.message}`);
  }

  // Fetch assets
  const { data: assets, error: assetError } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", user.id);

  if (assetError) {
    throw new Error(`Failed to fetch assets: ${assetError.message}`);
  }

  const txnData: Transaction[] = transactions || [];
  const assetData: Asset[] = assets || [];

  // Calculate KPIs
  const totalIncome = roundToTwoDecimals(
    txnData
      .filter((t) => t.type === "income")
      .reduce((sum: number, t) => sum + Number(t.amount), 0)
  );

  const totalExpenses = roundToTwoDecimals(
    txnData
      .filter((t) => t.type === "expense")
      .reduce((sum: number, t) => sum + Number(t.amount), 0)
  );

  const netSavings = roundToTwoDecimals(totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Calculate asset metrics
  const totalAssetValue = roundToTwoDecimals(
    assetData.reduce(
      (sum: number, asset) => sum + Number(asset.current_value),
      0
    )
  );

  const totalProfit = roundToTwoDecimals(
    assetData.reduce(
      (sum: number, asset) =>
        sum + (Number(asset.current_value) - Number(asset.purchase_value || 0)),
      0
    )
  );

  // Calculate average return percentage (only for assets with valid purchase values)
  let validAssetsCount = 0;
  const gainPercentage = assetData.reduce((sum: number, asset) => {
    // Skip assets with null or zero purchase value
    if (asset.purchase_value === null || asset.purchase_value === 0) {
      return sum;
    }
    const purchaseValue = Number(asset.purchase_value);
    const currentValue = Number(asset.current_value);
    validAssetsCount++;
    return sum + ((currentValue - purchaseValue) / purchaseValue) * 100;
  }, 0);

  const avgReturnPercentage =
    validAssetsCount > 0 ? gainPercentage / validAssetsCount : 0;

  // Calculate category breakdown
  const categoryData: Record<string, number> = {};
  txnData
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryData[t.category] = roundToTwoDecimals(
        (categoryData[t.category] || 0) + Number(t.amount)
      );
    });

  return {
    kpis: {
      totalIncome,
      totalExpenses,
      netSavings,
      totalAssets: totalAssetValue, // Use the same calculation
      savingsRate,
      totalAssetValue,
      totalProfit,
      avgReturnPercentage,
    },
    transactions: txnData,
    categoryData,
    timeRange,
  };
}
