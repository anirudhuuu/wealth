"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transaction } from "@/lib/types";
import { parseDateFromDatabase } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  Pie,
  PieChart,
  XAxis
} from "recharts";

interface DashboardChartsProps {
  transactions: Transaction[];
  categoryData: Record<string, number>;
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#f59e0b", // Changed from red to amber
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const chartConfig = {
  income: {
    label: "Income",
    color: "#10b981", // Green color for income
  },
  expenses: {
    label: "Expenses",
    color: "#f59e0b", // Amber color for expenses
  },
} satisfies ChartConfig;

// Create category chart config dynamically
const createCategoryChartConfig = (categories: string[]) => {
  const config: ChartConfig = {
    value: {
      label: "Amount",
    },
  };

  categories.forEach((category, index) => {
    config[category] = {
      label: category,
      color: COLORS[index % COLORS.length],
    };
  });

  return config;
};

export function DashboardCharts({
  transactions,
  categoryData,
}: DashboardChartsProps) {
  const [timeRange, setTimeRange] = React.useState("12m");

  // Prepare monthly trend data
  const monthlyData: Record<
    string,
    { month: string; income: number; expenses: number }
  > = {};

  transactions.forEach((txn) => {
    const date = parseDateFromDatabase(txn.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    const monthLabel = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { month: monthLabel, income: 0, expenses: 0 };
    }

    if (txn.type === "income") {
      monthlyData[monthKey].income += Number(txn.amount);
    } else {
      monthlyData[monthKey].expenses += Number(txn.amount);
    }
  });

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => {
    const dateA = new Date(a.month);
    const dateB = new Date(b.month);
    return dateA.getTime() - dateB.getTime();
  });

  // Filter data based on selected time range
  const filteredMonthlyData = monthlyChartData.filter((item) => {
    const itemDate = new Date(item.month);
    const referenceDate = new Date();
    let monthsToSubtract = 12;

    if (timeRange === "6m") {
      monthsToSubtract = 6;
    } else if (timeRange === "3m") {
      monthsToSubtract = 3;
    }

    const startDate = new Date(referenceDate);
    startDate.setMonth(startDate.getMonth() - monthsToSubtract);
    return itemDate >= startDate;
  });

  // Calculate trend for the footer
  const calculateTrend = () => {
    if (filteredMonthlyData.length < 2) return { trend: 0, isPositive: true };

    const latest = filteredMonthlyData[filteredMonthlyData.length - 1];
    const previous = filteredMonthlyData[filteredMonthlyData.length - 2];

    const latestNet = latest.income - latest.expenses;
    const previousNet = previous.income - previous.expenses;

    const trend =
      previousNet !== 0
        ? ((latestNet - previousNet) / Math.abs(previousNet)) * 100
        : 0;
    return { trend: Math.abs(trend), isPositive: trend >= 0 };
  };

  const { trend, isPositive } = calculateTrend();

  // Prepare category pie chart data
  const categoryChartData = Object.entries(categoryData).map(
    ([category, amount], index) => ({
      category: category,
      value: amount,
      fill: `var(--color-${category})`,
    })
  );

  const categoryChartConfig = createCategoryChartConfig(
    Object.keys(categoryData)
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Monthly Trend */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>
              Showing income and expenses for the last{" "}
              {filteredMonthlyData.length} months
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Last 12 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="12m" className="rounded-lg">
                Last 12 months
              </SelectItem>
              <SelectItem value="6m" className="rounded-lg">
                Last 6 months
              </SelectItem>
              <SelectItem value="3m" className="rounded-lg">
                Last 3 months
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredMonthlyData}>
              <defs>
                <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-expenses)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-expenses)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="expenses"
                type="natural"
                fill="url(#fillExpenses)"
                stroke="var(--color-expenses)"
                stackId="a"
              />
              <Area
                dataKey="income"
                type="natural"
                fill="url(#fillIncome)"
                stroke="var(--color-income)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent payload={[]} />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            {isPositive ? "Trending up" : "Trending down"} by {trend.toFixed(1)}
            % this month{" "}
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
          </div>
          <div className="text-muted-foreground leading-none">
            {filteredMonthlyData.length > 0 && (
              <>
                {filteredMonthlyData[0].month} -{" "}
                {filteredMonthlyData[filteredMonthlyData.length - 1].month}
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Category Breakdown */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Expense by Category</CardTitle>
          <CardDescription>
            Showing expense breakdown by category
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={categoryChartConfig}
            className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="value" hideLabel />}
              />
              <Pie data={categoryChartData} dataKey="value">
                <LabelList
                  dataKey="category"
                  className="fill-background"
                  stroke="none"
                  fontSize={12}
                  formatter={(value: React.ReactNode) => {
                    const categoryName = typeof value === "string" ? value : "";
                    return (
                      categoryChartConfig[categoryName]?.label || categoryName
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            Total categories: {Object.keys(categoryData).length}
          </div>
          <div className="text-muted-foreground leading-none">
            Showing expense distribution across all categories
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
