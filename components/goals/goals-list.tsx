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
import { useDeleteGoal } from "@/hooks/use-goals";
import { useDebounce } from "@/hooks/use-performance";
import type { Goal } from "@/lib/types";
import { Plus, Search, SortAsc, SortDesc, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { AddGoalDialog } from "./add-goal-dialog";
import { GoalCard } from "./goal-card";

interface GoalsListProps {
  goals: Goal[];
}

export function GoalsList({ goals }: GoalsListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "targetAmount" | "currentAmount" | "status" | "targetDate"
  >("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const deleteGoalMutation = useDeleteGoal();

  // Debounce search query to improve performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter and sort goals
  const filteredAndSortedGoals = useMemo(() => {
    let filtered = goals;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((goal) => goal.status === statusFilter);
    }

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (goal) =>
          goal.name.toLowerCase().includes(query) ||
          (goal.description && goal.description.toLowerCase().includes(query))
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
        case "targetAmount":
          aValue = Number(a.target_amount);
          bValue = Number(b.target_amount);
          break;
        case "currentAmount":
          aValue = Number(a.current_amount);
          bValue = Number(b.current_amount);
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "targetDate":
          aValue = a.target_date ? new Date(a.target_date).getTime() : 0;
          bValue = b.target_date ? new Date(b.target_date).getTime() : 0;
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
  }, [goals, debouncedSearchQuery, sortBy, sortOrder, statusFilter]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Goals</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
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
                  placeholder="Search goals by name or description..."
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
                  <SelectItem value="completed">Completed</SelectItem>
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
                      | "targetAmount"
                      | "currentAmount"
                      | "status"
                      | "targetDate"
                  ) => setSortBy(value)}
                >
                  <SelectTrigger className="w-[140px] shrink-0">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="targetAmount">Target Amount</SelectItem>
                    <SelectItem value="currentAmount">
                      Current Amount
                    </SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="targetDate">Target Date</SelectItem>
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
                Showing {filteredAndSortedGoals.length} of {goals.length} goals
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAndSortedGoals.length === 0 ? (
              <div className="col-span-full">
                <Empty>
                  <EmptyMedia variant="icon">
                    <Target className="h-8 w-8 opacity-50" />
                  </EmptyMedia>
                  <EmptyContent>
                    <EmptyTitle>
                      {searchQuery || statusFilter !== "all"
                        ? `No goals found matching your criteria`
                        : "No goals yet"}
                    </EmptyTitle>
                    <EmptyDescription>
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "Create your first financial goal to start tracking your progress"}
                    </EmptyDescription>
                    {!searchQuery && statusFilter === "all" && (
                      <Button size="sm" onClick={() => setShowAddDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Goal
                      </Button>
                    )}
                  </EmptyContent>
                </Empty>
              </div>
            ) : (
              filteredAndSortedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AddGoalDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </>
  );
}
