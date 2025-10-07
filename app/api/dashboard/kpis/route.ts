import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { roundToTwoDecimals } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    // Fetch transactions
    const { data: transactions, error: txnError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
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

    const txnData = transactions || [];
    const assetData = assets || [];

    // Calculate KPIs
    const totalIncome = roundToTwoDecimals(
      txnData
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    );

    const totalExpenses = roundToTwoDecimals(
      txnData
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0)
    );

    const netSavings = roundToTwoDecimals(totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    const totalAssets = roundToTwoDecimals(
      assetData.reduce(
        (sum: number, a: any) => sum + Number(a.current_value),
        0
      )
    );

    // Calculate category breakdown
    const categoryData: Record<string, number> = {};
    txnData
      .filter((t) => t.type === "expense")
      .forEach((t: any) => {
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
