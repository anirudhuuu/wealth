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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
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
import type { Ledger, Transaction } from "@/lib/types";
import { formatCurrency, parseDateFromDatabase } from "@/lib/utils";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
  Receipt,
  Repeat,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { EditTransactionDialog } from "./edit-transaction-dialog";

interface TransactionsListProps {
  transactions: Transaction[];
  ledgers: Ledger[];
}

export function TransactionsList({
  transactions,
  ledgers,
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
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "date" | "amount" | "description" | "category" | "type"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const deleteTransactionMutation = useDeleteTransaction();

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply ledger filter
    if (selectedLedgerId !== "all") {
      filtered = transactions.filter(
        (txn) => txn.ledger_id === selectedLedgerId
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (txn) =>
          txn.description.toLowerCase().includes(query) ||
          txn.category.toLowerCase().includes(query) ||
          txn.type.toLowerCase().includes(query) ||
          (txn.notes && txn.notes.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case "amount":
          aValue = Number(a.amount);
          bValue = Number(b.amount);
          break;
        case "description":
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case "category":
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case "type":
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, selectedLedgerId, searchQuery, sortBy, sortOrder]);

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

  // Pagination logic
  const totalItems = filteredAndSortedTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredAndSortedTransactions.slice(
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
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg sm:text-xl flex-shrink-0">
              All Payments
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              className="flex-shrink-0"
            >
              <Plus className="mr-1 sm:mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <div className="mt-4 space-y-4">
            {/* Search Input - Full width row */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-row gap-1 sm:gap-2 overflow-x-auto pb-2">
              {/* Ledger Filter */}
              <Select
                value={selectedLedgerId}
                onValueChange={handleLedgerFilterChange}
              >
                <SelectTrigger className="w-[120px] sm:w-[140px] flex-shrink-0">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {ledgers.map((ledger) => (
                    <SelectItem key={ledger.id} value={ledger.id}>
                      {ledger.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select
                value={sortBy}
                onValueChange={(
                  value: "date" | "amount" | "description" | "category" | "type"
                ) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[90px] sm:w-[100px] flex-shrink-0">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order - Icon Button */}
              <Button
                variant="outline"
                onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  setCurrentPage(1);
                }}
                className="w-[40px] sm:w-[44px] h-9 flex-shrink-0 p-0"
                title={
                  sortOrder === "asc" ? "Sort ascending" : "Sort descending"
                }
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Results count */}
          {(searchQuery || selectedLedgerId !== "all") && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredAndSortedTransactions.length} of{" "}
              {transactions.length} payments
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedTransactions.length === 0 ? (
              <Empty>
                <EmptyMedia variant="icon">
                  <Receipt className="h-8 w-8 opacity-50" />
                </EmptyMedia>
                <EmptyContent>
                  <EmptyTitle>
                    {searchQuery
                      ? `No payments found matching "${searchQuery}"`
                      : selectedLedgerId !== "all"
                      ? "No payments for selected account"
                      : "No payments yet"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {searchQuery || selectedLedgerId !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Add your first payment to start tracking your expenses"}
                  </EmptyDescription>
                  {!searchQuery && selectedLedgerId === "all" && (
                    <Button size="sm" onClick={() => setShowAddDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment
                    </Button>
                  )}
                </EmptyContent>
              </Empty>
            ) : (
              paginatedTransactions.map((txn) => {
                const isExpanded = expandedTransactions.has(txn.id);
                const ledger = ledgers.find((l) => l.id === txn.ledger_id);
                return (
                  <div
                    key={txn.id}
                    className="rounded-lg border p-4 sm:p-5 overflow-hidden mb-3"
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4 min-w-0">
                      <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 overflow-hidden">
                        <div
                          className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full flex-shrink-0 relative ${
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
                          {txn.template_id && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <Repeat className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="font-semibold text-xs sm:text-base mb-2 truncate">
                            {txn.description.length > 20
                              ? `${txn.description.substring(0, 20)}...`
                              : txn.description}
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                            <Badge
                              variant={
                                txn.type === "income" ? "default" : "secondary"
                              }
                              className={`text-xs flex-shrink-0 ${
                                txn.type === "income"
                                  ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300"
                                  : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {txn.type === "income" ? "Income" : "Expense"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs truncate max-w-[80px] sm:max-w-none"
                            >
                              {txn.category.length > 12
                                ? `${txn.category.substring(0, 12)}...`
                                : txn.category}
                            </Badge>
                            {txn.template_id && (
                              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                                <Repeat className="h-3 w-3" />
                                <span>Recurring</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">
                            {formatDate(txn.date)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 sm:gap-3 min-w-0 flex-shrink-0">
                        <div
                          className={`text-sm sm:text-lg font-bold truncate max-w-[100px] sm:max-w-none ${
                            txn.type === "income"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                          title={`${
                            txn.type === "income" ? "+" : "-"
                          }${formatCurrency(Number(txn.amount))}`}
                        >
                          {txn.type === "income" ? "+" : "-"}
                          {formatCurrency(Number(txn.amount))}
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTransactionExpansion(txn.id)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </Button>
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
                                  disabled={deleteTransactionMutation.isPending}
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
                                <AlertDialogFooter className="flex flex-row gap-2">
                                  <AlertDialogCancel className="flex-1">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteTransaction(txn.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700 flex-1"
                                  >
                                    Delete Payment
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <div className="mb-4">
                          <span className="text-sm text-muted-foreground">
                            Description:
                          </span>
                          <p className="text-sm mt-2 p-3 bg-muted rounded-md break-words">
                            {txn.description}
                          </p>
                        </div>
                        {txn.category.length > 20 && (
                          <div className="mb-4">
                            <span className="text-sm text-muted-foreground">
                              Category:
                            </span>
                            <p className="text-sm mt-2 p-3 bg-muted rounded-md break-words">
                              {txn.category}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-sm">
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
                          <div className="mt-3">
                            <span className="text-sm text-muted-foreground">
                              Notes:
                            </span>
                            <p className="text-sm mt-2 p-3 bg-muted rounded-md">
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

      {/* Comprehensive Pagination */}
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

              {/* Generate page numbers with ellipsis logic */}
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                const halfVisible = Math.floor(maxVisiblePages / 2);

                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total pages is small
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i)}
                          isActive={currentPage === i}
                          className="cursor-pointer"
                        >
                          {i}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                } else {
                  // Complex pagination with ellipsis
                  if (currentPage <= halfVisible + 1) {
                    // Show first pages + ellipsis + last page
                    for (let i = 1; i <= maxVisiblePages - 1; i++) {
                      pages.push(
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i)}
                            isActive={currentPage === i}
                            className="cursor-pointer"
                          >
                            {i}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    pages.push(
                      <PaginationItem key="ellipsis1">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                    pages.push(
                      <PaginationItem key={totalPages}>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          isActive={currentPage === totalPages}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (currentPage >= totalPages - halfVisible) {
                    // Show first page + ellipsis + last pages
                    pages.push(
                      <PaginationItem key={1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          isActive={currentPage === 1}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                    );
                    pages.push(
                      <PaginationItem key="ellipsis1">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                    for (
                      let i = totalPages - maxVisiblePages + 2;
                      i <= totalPages;
                      i++
                    ) {
                      pages.push(
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i)}
                            isActive={currentPage === i}
                            className="cursor-pointer"
                          >
                            {i}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  } else {
                    // Show first page + ellipsis + current page range + ellipsis + last page
                    pages.push(
                      <PaginationItem key={1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          isActive={currentPage === 1}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                    );
                    pages.push(
                      <PaginationItem key="ellipsis1">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );

                    const startPage = Math.max(2, currentPage - 1);
                    const endPage = Math.min(totalPages - 1, currentPage + 1);

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => setCurrentPage(i)}
                            isActive={currentPage === i}
                            className="cursor-pointer"
                          >
                            {i}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    pages.push(
                      <PaginationItem key="ellipsis2">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                    pages.push(
                      <PaginationItem key={totalPages}>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          isActive={currentPage === totalPages}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                }
                return pages;
              })()}

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
      <div className="mt-4 flex flex-row items-center justify-between gap-2">
        {totalItems > 0 && (
          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
            Viewing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
            {totalItems} payments
          </div>
        )}

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            Per page:
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
      </div>

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
    </>
  );
}
