"use client";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { SandboxBanner } from "@/components/sandbox-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardKPIs } from "@/hooks/use-dashboard";
import { useUserWithProfile } from "@/hooks/use-user";
import { exportAllDataToCsv } from "@/lib/csv-export";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function DashboardPage() {
  const {
    user,
    profile,
    isLoading: userLoading,
    isAdmin,
  } = useUserWithProfile();
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error,
  } = useDashboardKPIs();

  const isLoading = userLoading || dashboardLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Summary</h1>
          <p className="text-muted-foreground">
            Overview of your financial health
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">
            Failed to load dashboard data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Summary</h1>
          <p className="text-muted-foreground">
            Overview of your financial health
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Please sign in to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  const { kpis, transactions, categoryData } = dashboardData || {
    kpis: {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      totalAssets: 0,
      savingsRate: 0,
    },
    transactions: [],
    categoryData: {},
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Summary</h1>
            <p className="text-muted-foreground">
              Overview of your financial health
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportAllDataToCsv(transactions, [], [])}
            title="Export all data to CSV files"
          >
            <Download className="mr-2 h-4 w-4" />
            Export All Data
          </Button>
        </div>
      </div>

      {!isAdmin && <SandboxBanner />}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Money Earned
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold truncate"
              title={formatCurrency(kpis.totalIncome)}
            >
              {formatCurrency(kpis.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Money Spent
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold truncate"
              title={formatCurrency(kpis.totalExpenses)}
            >
              {formatCurrency(kpis.totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Money Saved
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold truncate"
              title={formatCurrency(kpis.netSavings)}
            >
              {formatCurrency(kpis.netSavings)}
            </div>
            <p
              className="text-xs text-muted-foreground truncate"
              title={`${kpis.savingsRate.toFixed(1)}% savings rate`}
            >
              {kpis.savingsRate.toFixed(1)}% how much you save
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Investments
            </CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold truncate"
              title={formatCurrency(kpis.totalAssets)}
            >
              {formatCurrency(kpis.totalAssets)}
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
