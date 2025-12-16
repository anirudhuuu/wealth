"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Debt, DebtPayment } from "@/lib/types";
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

interface DebtProgressChartProps {
  debt: Debt;
  payments: DebtPayment[];
}

interface ChartDataPoint {
  date: string;
  balance: number;
  principalPaid: number;
  interestPaid: number;
  principal: number;
}

export function DebtProgressChart({ debt, payments }: DebtProgressChartProps) {
  // Prepare chart data
  const chartData = useMemo(() => {
    if (!payments || payments.length === 0) {
      return [];
    }

    // Sort payments by date
    const sortedPayments = [...payments].sort(
      (a, b) =>
        new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
    );

    // Calculate balance over time
    let currentBalance = Number(debt.principal_amount);
    const data: ChartDataPoint[] = [
      {
        date: formatDate(debt.start_date),
        balance: currentBalance,
        principalPaid: 0,
        interestPaid: 0,
        principal: currentBalance,
      },
    ];

    sortedPayments.forEach((payment) => {
      currentBalance -= Number(payment.principal_paid);
      data.push({
        date: formatDate(payment.payment_date),
        balance: Math.max(0, currentBalance),
        principalPaid: Number(payment.principal_paid),
        interestPaid: Number(payment.interest_paid),
        principal: Number(debt.principal_amount),
      });
    });

    return data;
  }, [payments, debt]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debt Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No payments yet. Record your first payment to see progress.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Progress Over Time</CardTitle>
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
                formatCurrency(value, debt.currency).replace(/[^\d,.-]/g, "")
              }
            />
            <Tooltip
              formatter={(value: any) =>
                typeof value === "number"
                  ? formatCurrency(value, debt.currency)
                  : value
              }
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive))"
              fillOpacity={0.2}
              name="Balance"
            />
            <Area
              type="monotone"
              dataKey="principal"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              fill="transparent"
              name="Principal"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
