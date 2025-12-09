"use client";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardKPIs } from "@/lib/actions/dashboard-actions";
import { formatCurrency } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  TrendingUpDown,
  Wallet,
} from "lucide-react";

interface DashboardClientProps {
  user: User;
  dashboardData: DashboardKPIs;
}

export function DashboardClient({ user, dashboardData }: DashboardClientProps) {
  const { kpis, transactions, categoryData } = dashboardData;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Financial Summary
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Overview of your financial health
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Income & Expenses Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Money Earned
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div
                  className="font-mono text-2xl font-bold truncate"
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
                <ArrowDownRight className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div
                  className="font-mono text-2xl font-bold truncate"
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
                <PiggyBank className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div
                  className="font-mono text-2xl font-bold truncate"
                  title={formatCurrency(kpis.netSavings)}
                >
                  {formatCurrency(kpis.netSavings)}
                </div>
                <p
                  className="font-mono text-xs text-muted-foreground truncate"
                  title={`${kpis.savingsRate.toFixed(1)}% savings rate`}
                >
                  {kpis.savingsRate.toFixed(1)}% savings rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Investments
                </CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div
                  className="font-mono text-2xl font-bold truncate"
                  title={formatCurrency(kpis.totalAssets)}
                >
                  {formatCurrency(kpis.totalAssets)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Performance Row */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Portfolio Value
                </CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div
                  className="font-mono text-2xl font-bold truncate"
                  title={formatCurrency(kpis.totalAssetValue)}
                >
                  {formatCurrency(kpis.totalAssetValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current market value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Profit/Loss
                </CardTitle>
                {kpis.totalProfit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-secondary" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`flex items-center gap-2 font-mono text-2xl font-bold ${
                    kpis.totalProfit >= 0
                      ? "text-secondary"
                      : "text-destructive"
                  }`}
                >
                  {kpis.totalProfit >= 0 ? (
                    <TrendingUp className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-5 w-5 flex-shrink-0" />
                  )}
                  <span
                    className="truncate"
                    title={formatCurrency(Math.abs(kpis.totalProfit))}
                  >
                    {kpis.totalProfit >= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(kpis.totalProfit))}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Unrealized gains/losses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Return
                </CardTitle>
                <TrendingUpDown className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div
                  className={`flex items-center gap-2 font-mono text-2xl font-bold ${
                    kpis.avgReturnPercentage >= 0
                      ? "text-secondary"
                      : "text-destructive"
                  }`}
                  title={`${
                    kpis.avgReturnPercentage >= 0 ? "+" : ""
                  }${kpis.avgReturnPercentage.toFixed(2)}%`}
                >
                  <TrendingUpDown className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">
                    {kpis.avgReturnPercentage >= 0 ? "+" : ""}
                    {kpis.avgReturnPercentage.toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all investments
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Charts */}
          <DashboardCharts
            transactions={transactions}
            categoryData={categoryData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
