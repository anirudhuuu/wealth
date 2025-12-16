"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Goal, GoalContribution } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface GoalProgressChartProps {
  goal: Goal;
  contributions: GoalContribution[];
}

interface ChartDataPoint {
  date: string;
  amount: number;
  cumulative: number;
  target: number;
  milestone?: string;
}

export function GoalProgressChart({
  goal,
  contributions,
}: GoalProgressChartProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    if (!contributions || contributions.length === 0) {
      return [];
    }

    // Sort contributions by date
    const sortedContributions = [...contributions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate cumulative progress
    let cumulativeAmount = 0;
    const data: ChartDataPoint[] = sortedContributions.map((contribution) => {
      cumulativeAmount += Number(contribution.amount);
      return {
        date: formatDate(contribution.date),
        amount: Number(contribution.amount),
        cumulative: cumulativeAmount,
        target: Number(goal.target_amount),
      };
    });

    // Add milestone markers if they exist
    if (goal.milestones && goal.milestones.length > 0) {
      goal.milestones.forEach((milestone) => {
        const milestoneReached = data.some(
          (d) => d.cumulative >= milestone.amount
        );
        if (milestoneReached) {
          // Find the point where milestone was reached
          const milestonePoint = data.find(
            (d) => d.cumulative >= milestone.amount
          );
          if (milestonePoint) {
            (milestonePoint as ChartDataPoint).milestone = milestone.label;
          }
        }
      });
    }

    return data;
  }, [contributions, goal]) as ChartDataPoint[];

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No contributions yet. Add your first contribution to see progress.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                formatCurrency(value, goal.currency).replace(/[^\d,.-]/g, "")
              }
            />
            <Tooltip
              formatter={(value: any) =>
                typeof value === "number"
                  ? formatCurrency(value, goal.currency)
                  : value
              }
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
              name="Total Saved"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              fill="transparent"
              name="Target"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
