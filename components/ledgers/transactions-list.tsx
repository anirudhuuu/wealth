"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Ledger, Transaction } from "@/lib/types";
import { ArrowDownRight, ArrowUpRight, Plus, Receipt } from "lucide-react";
import { useState } from "react";
import { AddTransactionDialog } from "./add-transaction-dialog";

interface TransactionsListProps {
  transactions: Transaction[];
  ledgers: Ledger[];
  isAdmin: boolean;
}

export function TransactionsList({
  transactions,
  ledgers,
  isAdmin,
}: TransactionsListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Receipt className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No transactions yet</p>
                {isAdmin && (
                  <p className="mt-1">
                    Add your first transaction to start tracking
                  </p>
                )}
              </div>
            ) : (
              transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        txn.type === "income"
                          ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                      }`}
                    >
                      {txn.type === "income" ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{txn.description}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{txn.category}</span>
                        <span>•</span>
                        <span>{formatDate(txn.date)}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-right font-semibold ${
                      txn.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {txn.type === "income" ? "+" : "-"}
                    {formatCurrency(Number(txn.amount))}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <AddTransactionDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          ledgers={ledgers}
        />
      )}
    </>
  );
}
