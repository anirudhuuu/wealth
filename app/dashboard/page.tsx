import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { SandboxBanner } from "@/components/sandbox-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile, requireAuth } from "@/lib/auth";
import {
  calculateSandboxKPIs,
  generateSandboxTransactions,
} from "@/lib/sandbox";
import { createClient } from "@/lib/supabase/server";
import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);
  const isAdmin = profile?.is_admin ?? false;

  let totalIncome = 0;
  let totalExpenses = 0;
  let netSavings = 0;
  let totalAssets = 0;
  let savingsRate = 0;
  let transactions = [];
  const categoryData: Record<string, number> = {};

  if (isAdmin) {
    const supabase = await createClient();

    // Fetch real transactions
    const { data: txnData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    transactions = txnData || [];

    // Calculate KPIs
    totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    netSavings = totalIncome - totalExpenses;
    savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Fetch assets
    const { data: assetData } = await supabase
      .from("assets")
      .select("*")
      .eq("user_id", user.id);

    totalAssets = (assetData || []).reduce(
      (sum, a) => sum + Number(a.current_value),
      0
    );

    // Calculate category breakdown
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryData[t.category] =
          (categoryData[t.category] || 0) + Number(t.amount);
      });
  } else {
    // Sandbox mode
    const kpis = calculateSandboxKPIs();
    totalIncome = kpis.totalIncome;
    totalExpenses = kpis.totalExpenses;
    netSavings = kpis.netSavings;
    totalAssets = kpis.totalAssets;
    savingsRate = kpis.savingsRate;

    transactions = generateSandboxTransactions();

    // Calculate category breakdown
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
      });
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial health
        </p>
      </div>

      {!isAdmin && <SandboxBanner />}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Savings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(netSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsRate.toFixed(1)}% savings rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAssets)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts
        transactions={transactions}
        categoryData={categoryData}
      />
    </div>
  );
}
