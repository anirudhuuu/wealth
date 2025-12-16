"use client";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-performance";
import type { Debt, Ledger } from "@/lib/types";
import { CreditCard, Plus, Search, SortAsc, SortDesc } from "lucide-react";
import { useMemo, useState } from "react";
import { AddDebtDialog } from "./add-debt-dialog";
import { DebtCard } from "./debt-card";

interface DebtsListProps {
  debts: Debt[];
  ledgers: Ledger[];
}

export function DebtsList({ debts, ledgers }: DebtsListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "balance" | "interestRate" | "status" | "nextPaymentDate"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounce search query to improve performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter and sort debts
  const filteredAndSortedDebts = useMemo(() => {
    let filtered = debts;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((debt) => debt.status === statusFilter);
    }

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (debt) =>
          debt.name.toLowerCase().includes(query) ||
          (debt.creditor_name &&
            debt.creditor_name.toLowerCase().includes(query)) ||
          (debt.notes && debt.notes.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date | null;
      let bValue: string | number | Date | null;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "balance":
          aValue = Number(a.current_balance);
          bValue = Number(b.current_balance);
          break;
        case "interestRate":
          aValue = Number(a.interest_rate);
          bValue = Number(b.interest_rate);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "nextPaymentDate":
          aValue = a.next_payment_date
            ? new Date(a.next_payment_date).getTime()
            : 0;
          bValue = b.next_payment_date
            ? new Date(b.next_payment_date).getTime()
            : 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [debts, debouncedSearchQuery, sortBy, sortOrder, statusFilter]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Debts</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Debt
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Sort Controls */}
          <div className="mb-6 space-y-4 lg:space-y-0">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-2">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search debts by name, creditor, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] shrink-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paid_off">Paid Off</SelectItem>
                  <SelectItem value="defaulted">Defaulted</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Controls */}
              <div className="flex flex-row gap-2 overflow-x-auto lg:overflow-x-visible">
                {/* Sort By */}
                <Select
                  value={sortBy}
                  onValueChange={(
                    value:
                      | "name"
                      | "balance"
                      | "interestRate"
                      | "status"
                      | "nextPaymentDate"
                  ) => setSortBy(value)}
                >
                  <SelectTrigger className="w-[140px] shrink-0">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="balance">Balance</SelectItem>
                    <SelectItem value="interestRate">Interest Rate</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="nextPaymentDate">
                      Next Payment
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Order - Icon Button */}
                <Button
                  variant="outline"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="w-[40px] sm:w-[44px] h-9 shrink-0 p-0"
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
            {(searchQuery || statusFilter !== "all") && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredAndSortedDebts.length} of {debts.length} debts
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAndSortedDebts.length === 0 ? (
              <div className="col-span-full">
                <Empty>
                  <EmptyMedia variant="icon">
                    <CreditCard className="h-8 w-8 opacity-50" />
                  </EmptyMedia>
                  <EmptyContent>
                    <EmptyTitle>
                      {searchQuery || statusFilter !== "all"
                        ? `No debts found matching your criteria`
                        : "No debts yet"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Add your first debt to start tracking and managing payments"}
                    </EmptyDescription>
                    {!searchQuery && statusFilter === "all" && (
                      <Button size="sm" onClick={() => setShowAddDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Debt
                      </Button>
                    )}
                  </EmptyContent>
                </Empty>
              </div>
            ) : (
              filteredAndSortedDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onEdit={setEditingDebt}
                  ledgers={ledgers}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddDebtDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        ledgers={ledgers}
      />
    </>
  );
}
