"use client";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteTransaction } from "@/hooks/use-transactions";
import { parseDateFromDatabase } from "@/lib/repositories/utils";
import type { Ledger, Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
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
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const deleteTransactionMutation = useDeleteTransaction();

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

  const formatDate = (dateString: string) => {
    return parseDateFromDatabase(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDeleteTransaction = (transactionId: string) => {
    deleteTransactionMutation.mutate(transactionId);
  };

  // Filter transactions based on selected ledger and sort by date (newest first)
  const filteredTransactions = (
    selectedLedgerId === "all"
      ? transactions
      : transactions.filter((txn) => txn.ledger_id === selectedLedgerId)
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination logic
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  // Reset to first page when filter changes
  const handleLedgerFilterChange = (value: string) => {
    setSelectedLedgerId(value);
    setCurrentPage(1);
  };

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
          <div className="mt-3 space-y-1 sm:space-y-2">
            <div className="flex flex-col gap-1 sm:gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Select
                value={selectedLedgerId}
                onValueChange={handleLedgerFilterChange}
              >
                <SelectTrigger className="w-full sm:w-auto">
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {paginatedTransactions.length === 0 ? (
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
              paginatedTransactions.map((txn) => {
                const isExpanded = expandedTransactions.has(txn.id);
                const ledger = ledgers.find((l) => l.id === txn.ledger_id);
                return (
                  <div
                    key={txn.id}
                    className="rounded-lg border p-3 sm:p-4 overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-3 min-w-0">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <div
                          className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full flex-shrink-0 ${
                            txn.type === "income"
                              ? "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                              : "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                          }`}
                        >
                          {txn.type === "income" ? (
                            <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 sm:h-6 sm:w-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="font-semibold text-sm sm:text-base mb-1">
                            {txn.description.length > 25
                              ? `${txn.description.substring(0, 25)}...`
                              : txn.description}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground mb-1">
                            {txn.category.length > 15
                              ? `${txn.category.substring(0, 15)}...`
                              : txn.category}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">
                            {formatDate(txn.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 sm:gap-2">
                        <div
                          className={`text-base sm:text-lg font-bold ${
                            txn.type === "income"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {txn.type === "income" ? "+" : "-"}
                          {formatCurrency(Number(txn.amount))}
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTransactionExpansion(txn.id)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
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
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={
                                      deleteTransactionMutation.isPending
                                    }
                                    className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
                            <span
                              className="font-medium truncate max-w-[120px]"
                              title={ledger?.name || "Unknown"}
                            >
                              {ledger?.name || "Unknown"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium capitalize">
                              {txn.type}
                            </span>
                          </div>
                          {txn.category.length <= 20 && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Category:
                              </span>
                              <span className="font-medium">
                                {txn.category}
                              </span>
                            </div>
                          )}
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

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationLink isActive={true} className="cursor-default">
                  {currentPage} / {totalPages}
                </PaginationLink>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Show:
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {totalItems > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
            {totalItems} transactions
          </div>
        )}
      </div>

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
