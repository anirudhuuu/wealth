import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Asset, Transaction } from "@/lib/types";
import { formatDateForDatabase, roundToTwoDecimals } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100); // Max 100 transactions
    const offset = parseInt(searchParams.get("offset") || "0");
    const timeRange = searchParams.get("timeRange") || "12m";

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "3m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "6m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case "12m":
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Fetch transactions with pagination and date filter
    const { data: transactions, error: txnError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", formatDateForDatabase(startDate))
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (txnError) {
      throw new Error(`Failed to fetch transactions: ${txnError.message}`);
    }

    // Fetch assets (no pagination needed for assets as they're typically fewer)
    const { data: assets, error: assetError } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", user.id);

    if (assetError) {
      throw new Error(`Failed to fetch assets: ${assetError.message}`);
    }

    // Get total count for pagination
    const { count: totalTransactions } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("date", formatDateForDatabase(startDate));

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

    const totalAssets = roundToTwoDecimals(
      assetData.reduce(
        (sum: number, a) => sum + Number(a.current_value),
        0
      )
    );

    // Calculate category breakdown
    const categoryData: Record<string, number> = {};
    txnData
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryData[t.category] = roundToTwoDecimals(
          (categoryData[t.category] || 0) + Number(t.amount)
        );
      });

    return NextResponse.json({
      kpis: {
        totalIncome,
        totalExpenses,
        netSavings,
        totalAssets,
        savingsRate,
      },
      transactions: txnData,
      categoryData,
      pagination: {
        total: totalTransactions || 0,
        limit,
        offset,
        hasMore: (totalTransactions || 0) > offset + limit,
      },
      timeRange,
    });
  } catch (error) {
    console.error("Dashboard KPIs error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}
