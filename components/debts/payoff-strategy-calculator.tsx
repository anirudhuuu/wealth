"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculatePayoffStrategy } from "@/lib/actions/debt-actions";
import type { Debt, PayoffStrategy } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface PayoffStrategyCalculatorProps {
  debts: Debt[];
}

export function PayoffStrategyCalculator({
  debts,
}: PayoffStrategyCalculatorProps) {
  const [selectedDebtIds, setSelectedDebtIds] = useState<string[]>([]);
  const [extraPayment, setExtraPayment] = useState<string>("0");
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">(
    "snowball"
  );

  const activeDebts = debts.filter((d) => d.status === "active");

  const { data: strategyResult, isLoading } = useQuery<PayoffStrategy>({
    queryKey: ["payoff-strategy", selectedDebtIds, extraPayment, strategy],
    queryFn: () =>
      calculatePayoffStrategy(
        selectedDebtIds,
        strategy,
        parseFloat(extraPayment) || 0
      ),
    enabled: selectedDebtIds.length > 0,
  });

  const toggleDebtSelection = (debtId: string) => {
    setSelectedDebtIds((prev) =>
      prev.includes(debtId)
        ? prev.filter((id) => id !== debtId)
        : [...prev, debtId]
    );
  };

  if (activeDebts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payoff Strategy Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No active debts to calculate payoff strategies for
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payoff Strategy Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Debt Selection */}
        <div>
          <Label className="mb-2 block">Select Debts</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
            {activeDebts.map((debt) => (
              <label
                key={debt.id}
                className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={selectedDebtIds.includes(debt.id)}
                  onChange={() => toggleDebtSelection(debt.id)}
                  className="rounded"
                />
                <span className="text-sm flex-1">
                  {debt.name} -{" "}
                  {formatCurrency(Number(debt.current_balance), debt.currency)}{" "}
                  @ {debt.interest_rate}%
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Strategy Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Strategy</Label>
            <Select
              value={strategy}
              onValueChange={(value: "snowball" | "avalanche") =>
                setStrategy(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="snowball">Snowball</SelectItem>
                <SelectItem value="avalanche">Avalanche</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Extra Payment (Monthly)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {strategyResult && !isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">
                  Total Months
                </div>
                <div className="text-2xl font-bold">
                  {strategyResult.totalMonths}
                </div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">
                  Total Interest
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(strategyResult.totalInterest, "INR")}
                </div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">
                  Total Payments
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(strategyResult.totalPayments, "INR")}
                </div>
              </div>
            </div>

            {/* Payoff Order */}
            <div>
              <Label className="mb-2 block">Payoff Order</Label>
              <div className="space-y-2">
                {strategyResult.payoffOrder.map((item, index) => (
                  <div
                    key={item.debtId}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span className="text-sm">{item.debtName}</span>
                    </div>
                    <div className="text-right text-sm">
                      <div>Month {item.payoffMonth}</div>
                      <div className="text-muted-foreground">
                        Interest: {formatCurrency(item.interestPaid, "INR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-muted-foreground py-8">
            Calculating payoff strategy...
          </div>
        )}

        {selectedDebtIds.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Select at least one debt to calculate payoff strategy
          </div>
        )}
      </CardContent>
    </Card>
  );
}
