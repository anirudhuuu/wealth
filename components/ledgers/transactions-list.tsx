"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Ledger, Transaction } from "@/lib/types";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Edit,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { EditTransactionDialog } from "./edit-transaction-dialog";

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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>("all");
  const [deletingTransactionId, setDeletingTransactionId] = useState<
    string | null
  >(null);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(
    new Set()
  );
  const router = useRouter();

  const toggleTransactionExpansion = (transactionId: string) => {
    setExpandedTransactions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

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

  const handleDeleteTransaction = async (transactionId: string) => {
    setDeletingTransactionId(transactionId);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction. Please try again.");
    } finally {
      setDeletingTransactionId(null);
    }
  };

  // Filter transactions based on selected ledger
  const filteredTransactions =
    selectedLedgerId === "all"
      ? transactions
      : transactions.filter((txn) => txn.ledger_id === selectedLedgerId);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Transactions</CardTitle>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            )}
          </div>
          <div className="mt-4">
            <Select
              value={selectedLedgerId}
              onValueChange={setSelectedLedgerId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by ledger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ledgers</SelectItem>
                {ledgers.map((ledger) => (
                  <SelectItem key={ledger.id} value={ledger.id}>
                    {ledger.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Receipt className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>
                  {selectedLedgerId === "all"
                    ? "No transactions yet"
                    : "No transactions for selected ledger"}
                </p>
                {isAdmin && (
                  <p className="mt-1">
                    Add your first transaction to start tracking
                  </p>
                )}
              </div>
            ) : (
              filteredTransactions.map((txn) => {
                const isExpanded = expandedTransactions.has(txn.id);
                const ledger = ledgers.find((l) => l.id === txn.ledger_id);
                return (
                  <div
                    key={txn.id}
                    className="rounded-lg border p-4 overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3 min-w-0">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0 ${
                            txn.type === "income"
                              ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                              : "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                          }`}
                        >
                          {txn.type === "income" ? (
                            <ArrowUpRight className="h-6 w-6" />
                          ) : (
                            <ArrowDownRight className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="font-semibold text-base mb-1">
                            {txn.description.length > 30
                              ? `${txn.description.substring(0, 30)}...`
                              : txn.description}
                          </div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {txn.category.length > 20
                              ? `${txn.category.substring(0, 20)}...`
                              : txn.category}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {formatDate(txn.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div
                          className={`text-lg font-bold ${
                            txn.type === "income"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {txn.type === "income" ? "+" : "-"}
                          {formatCurrency(Number(txn.amount))}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTransactionExpansion(txn.id)}
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(txn);
                                  setShowEditDialog(true);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={deletingTransactionId === txn.id}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete the transaction "
                                      {txn.description}" and remove it from your
                                      records.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteTransaction(txn.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete Transaction
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        <div className="mb-3">
                          <span className="text-sm text-muted-foreground">
                            Description:
                          </span>
                          <p className="text-sm mt-1 p-2 bg-muted rounded-md break-words">
                            {txn.description}
                          </p>
                        </div>
                        {txn.category.length > 20 && (
                          <div className="mb-3">
                            <span className="text-sm text-muted-foreground">
                              Category:
                            </span>
                            <p className="text-sm mt-1 p-2 bg-muted rounded-md break-words">
                              {txn.category}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Ledger:
                            </span>
                            <span className="font-medium">
                              {ledger?.name || "Unknown"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium capitalize">
                              {txn.type}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Category:
                            </span>
                            <span className="font-medium">{txn.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium">
                              {formatDate(txn.date)}
                            </span>
                          </div>
                        </div>
                        {txn.notes && (
                          <div className="mt-2">
                            <span className="text-sm text-muted-foreground">
                              Notes:
                            </span>
                            <p className="text-sm mt-1 p-2 bg-muted rounded-md">
                              {txn.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <>
          <AddTransactionDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            ledgers={ledgers}
          />
          <EditTransactionDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            transaction={selectedTransaction}
            ledgers={ledgers}
          />
        </>
      )}
    </>
  );
}
