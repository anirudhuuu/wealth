"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Ledger, Transaction } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { z } from "zod";
import { toast } from "sonner";
import { AddLedgerDialog } from "./add-ledger-dialog";

// Validation schema for ledger name
const ledgerNameSchema = z.object({
  name: z
    .string()
    .min(1, "Ledger name is required")
    .max(100, "Ledger name must be less than 100 characters"),
});

type LedgerNameFormData = z.infer<typeof ledgerNameSchema>;

interface LedgersListProps {
  ledgers: Ledger[];
  transactions: Transaction[];
  isAdmin: boolean;
}

export function LedgersList({
  ledgers,
  transactions,
  isAdmin,
}: LedgersListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expandedLedgers, setExpandedLedgers] = useState<Set<string>>(
    new Set()
  );
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
  const [deletingLedger, setDeletingLedger] = useState<Ledger | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const form = useForm<LedgerNameFormData>({
    resolver: zodResolver(ledgerNameSchema),
    defaultValues: {
      name: "",
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleLedgerExpansion = (ledgerId: string) => {
    setExpandedLedgers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ledgerId)) {
        newSet.delete(ledgerId);
      } else {
        newSet.add(ledgerId);
      }
      return newSet;
    });
  };

  const getLedgerSpending = (ledgerId: string) => {
    const ledgerTransactions = transactions.filter(
      (txn) => txn.ledger_id === ledgerId
    );

    const totalIncome = ledgerTransactions
      .filter((txn) => txn.type === "income")
      .reduce((sum, txn) => sum + Number(txn.amount), 0);

    const totalExpenses = ledgerTransactions
      .filter((txn) => txn.type === "expense")
      .reduce((sum, txn) => sum + Number(txn.amount), 0);

    return {
      income: totalIncome,
      expenses: totalExpenses,
      net: totalIncome - totalExpenses,
      transactionCount: ledgerTransactions.length,
    };
  };

  const getLedgerTypeColor = (type: string) => {
    switch (type) {
      case "family":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "personal":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "loan":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const handleEditLedger = async (data: LedgerNameFormData) => {
    if (!editingLedger) return;

    setIsUpdating(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("ledgers")
        .update({ name: data.name.trim() })
        .eq("id", editingLedger.id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Reset form and close dialog
      setEditingLedger(null);
      form.reset();
      router.refresh();
      toast.success("Ledger updated successfully");
    } catch (error) {
      console.error("Error updating ledger:", error);
      toast.error("Failed to update ledger. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditDialog = (ledger: Ledger) => {
    setEditingLedger(ledger);
    form.reset({ name: ledger.name });
  };

  const handleDeleteLedger = async () => {
    if (!deletingLedger) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Delete the ledger (only empty ledgers can be deleted)
      const { error } = await supabase
        .from("ledgers")
        .delete()
        .eq("id", deletingLedger.id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Reset state and close dialog
      setDeletingLedger(null);
      router.refresh();
      toast.success("Ledger deleted successfully");
    } catch (error) {
      console.error("Error deleting ledger:", error);
      toast.error("Failed to delete ledger. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getLedgerTransactionCount = (ledgerId: string) => {
    return transactions.filter((txn) => txn.ledger_id === ledgerId).length;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ledgers</CardTitle>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ledgers.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Wallet className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No ledgers yet</p>
                {isAdmin && (
                  <p className="mt-1">
                    Create your first ledger to get started
                  </p>
                )}
              </div>
            ) : (
              ledgers.map((ledger) => {
                const spending = getLedgerSpending(ledger.id);
                const isExpanded = expandedLedgers.has(ledger.id);
                return (
                  <div key={ledger.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div
                          className="font-medium truncate"
                          title={ledger.name}
                        >
                          {ledger.name}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getLedgerTypeColor(
                              ledger.type
                            )}`}
                          >
                            {ledger.type.charAt(0).toUpperCase() +
                              ledger.type.slice(1).toLowerCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {ledger.currency}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(ledger)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingLedger(ledger)}
                              disabled={spending.transactionCount > 0}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-gray-400 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                              title={
                                spending.transactionCount > 0
                                  ? "Cannot delete ledger with transactions"
                                  : "Delete ledger"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {spending.transactionCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLedgerExpansion(ledger.id)}
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {spending.transactionCount > 0 && isExpanded && (
                      <div className="mt-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Income:
                            </span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(spending.income)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Expenses:
                            </span>
                            <span className="font-medium text-amber-600">
                              {formatCurrency(spending.expenses)}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-medium">Net:</span>
                          <span
                            className={`text-sm font-semibold ${
                              spending.net >= 0
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            {formatCurrency(spending.net)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {spending.transactionCount} transaction
                          {spending.transactionCount !== 1 ? "s" : ""}
                        </div>
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
        <AddLedgerDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      )}

      {/* Edit Ledger Dialog */}
      <AlertDialog
        open={!!editingLedger}
        onOpenChange={() => setEditingLedger(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Ledger Name</AlertDialogTitle>
            <AlertDialogDescription>
              Update the name of "{editingLedger?.name}"
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditLedger)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ledger Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter ledger name"
                        disabled={isUpdating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isUpdating}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isUpdating ? "Updating..." : "Update Ledger"}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Ledger Dialog */}
      <AlertDialog
        open={
          !!deletingLedger &&
          getLedgerTransactionCount(deletingLedger?.id || "") === 0
        }
        onOpenChange={() => setDeletingLedger(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ledger</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingLedger?.name}"? This
              will permanently delete the ledger.
              <br />
              <br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLedger}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Ledger"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
