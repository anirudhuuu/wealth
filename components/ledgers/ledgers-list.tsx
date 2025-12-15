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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDeleteLedger, useUpdateLedger } from "@/hooks/use-ledgers";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Ledger, Transaction } from "@/lib/types";
import { formatCurrency, roundToTwoDecimals } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { AddLedgerDialog } from "./add-ledger-dialog";

// Validation schema for ledger name
const ledgerEditSchema = z.object({
  name: z
    .string()
    .min(1, "Budget name is required")
    .max(100, "Budget name must be less than 100 characters"),
  type: z.enum(["family", "personal", "loan"], {
    message: "Please select a budget book type",
  }),
  currency: z
    .string()
    .min(1, "Currency is required")
    .max(10, "Currency code must be less than 10 characters"),
});

type LedgerEditFormData = z.infer<typeof ledgerEditSchema>;

// Reusable form component for editing ledgers
function EditLedgerForm({
  form,
  onSubmit,
  updateLedgerMutation,
  onOpenChange,
  className,
  showCancelButton = true,
}: {
  form: UseFormReturn<LedgerEditFormData>;
  onSubmit: (data: LedgerEditFormData) => void;
  updateLedgerMutation: ReturnType<typeof useUpdateLedger>;
  onOpenChange: (open: boolean) => void;
  className?: string;
  showCancelButton?: boolean;
}) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-4 ${className || ""}`}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter budget book name"
                  disabled={updateLedgerMutation.isPending}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Type</FormLabel>
                <Select
                  disabled={updateLedgerMutation.isPending}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select budget book type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="loan">Loan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency (₹, $, €, £)</FormLabel>
                <Select
                  disabled={updateLedgerMutation.isPending}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showCancelButton && (
          <div className="flex flex-row gap-2">
            <Button
              type="submit"
              disabled={updateLedgerMutation.isPending}
              className="bg-primary hover:bg-primary/90 flex-1"
            >
              {updateLedgerMutation.isPending
                ? "Saving changes..."
                : "Update Ledger"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateLedgerMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}

interface LedgersListProps {
  ledgers: Ledger[];
  transactions: Transaction[];
}

export function LedgersList({ ledgers, transactions }: LedgersListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expandedLedgers, setExpandedLedgers] = useState<Set<string>>(
    new Set()
  );
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
  const [deletingLedger, setDeletingLedger] = useState<Ledger | null>(null);

  // React Query mutations
  const updateLedgerMutation = useUpdateLedger();
  const deleteLedgerMutation = useDeleteLedger();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<LedgerEditFormData>({
    resolver: zodResolver(ledgerEditSchema),
    defaultValues: {
      name: "",
      type: "personal",
      currency: "INR",
    },
  });

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

    const totalIncome = roundToTwoDecimals(
      ledgerTransactions
        .filter((txn) => txn.type === "income")
        .reduce((sum, txn) => sum + Number(txn.amount), 0)
    );

    const totalExpenses = roundToTwoDecimals(
      ledgerTransactions
        .filter((txn) => txn.type === "expense")
        .reduce((sum, txn) => sum + Number(txn.amount), 0)
    );

    return {
      income: totalIncome,
      expenses: totalExpenses,
      net: roundToTwoDecimals(totalIncome - totalExpenses),
      transactionCount: ledgerTransactions.length,
    };
  };

  const getLedgerTypeColor = (type: string) => {
    switch (type) {
      case "family":
        return "bg-primary/10 text-primary";
      case "personal":
        return "bg-secondary/10 text-secondary";
      case "loan":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleEditLedger = async (data: LedgerEditFormData) => {
    if (!editingLedger) return;

    updateLedgerMutation.mutate(
      {
        id: editingLedger.id,
        input: {
          name: data.name.trim(),
          type: data.type,
          currency: data.currency,
        },
      },
      {
        onSuccess: () => {
          setEditingLedger(null);
          form.reset();
        },
      }
    );
  };

  const openEditDialog = (ledger: Ledger) => {
    setEditingLedger(ledger);
    form.reset({
      name: ledger.name,
      type: ledger.type,
      currency: ledger.currency,
    });
  };

  const handleDeleteLedger = async () => {
    if (!deletingLedger) return;

    deleteLedgerMutation.mutate(deletingLedger.id, {
      onSuccess: () => {
        setDeletingLedger(null);
      },
    });
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
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ledgers.length === 0 ? (
              <Empty>
                <EmptyMedia variant="icon">
                  <Wallet className="h-8 w-8 opacity-50" />
                </EmptyMedia>
                <EmptyContent>
                  <EmptyTitle>No ledgers yet</EmptyTitle>
                  <EmptyDescription>
                    Create your first budget book to get started
                  </EmptyDescription>
                  <Button size="sm" onClick={() => setShowAddDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Ledger
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              ledgers.map((ledger) => {
                const spending = getLedgerSpending(ledger.id);
                const isExpanded = expandedLedgers.has(ledger.id);
                return (
                  <div
                    key={ledger.id}
                    className="rounded-lg border p-4 sm:p-5 mb-3"
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium truncate mb-2"
                          title={ledger.name}
                        >
                          {ledger.name}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
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
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10 disabled:text-muted-foreground disabled:hover:text-muted-foreground disabled:hover:bg-transparent"
                            title={
                              spending.transactionCount > 0
                                ? "Cannot delete ledger with transactions"
                                : "Delete ledger"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                        {spending.transactionCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLedgerExpansion(ledger.id)}
                            className="h-8 w-8 p-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {spending.transactionCount > 0 && isExpanded && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between min-w-0">
                            <span className="text-muted-foreground shrink-0">
                              Income:
                            </span>
                            <span
                              className="font-medium text-secondary truncate ml-2"
                              title={formatCurrency(spending.income)}
                            >
                              {formatCurrency(spending.income)}
                            </span>
                          </div>
                          <div className="flex justify-between min-w-0">
                            <span className="text-muted-foreground shrink-0">
                              Expenses:
                            </span>
                            <span
                              className="font-medium text-primary truncate ml-2"
                              title={formatCurrency(spending.expenses)}
                            >
                              {formatCurrency(spending.expenses)}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between border-t pt-3 min-w-0">
                          <span className="text-sm font-medium shrink-0">
                            Net:
                          </span>
                          <span
                            className={`text-sm font-semibold truncate ml-2 ${
                              spending.net >= 0
                                ? "text-secondary"
                                : "text-primary"
                            }`}
                            title={formatCurrency(spending.net)}
                          >
                            {formatCurrency(spending.net)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
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

      <AddLedgerDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      {/* Edit Ledger Dialog/Drawer */}
      {isDesktop ? (
        <Dialog
          open={!!editingLedger}
          onOpenChange={() => setEditingLedger(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Ledger</DialogTitle>
              <DialogDescription>
                Update the details for "{editingLedger?.name}"
              </DialogDescription>
            </DialogHeader>
            <EditLedgerForm
              form={form}
              onSubmit={handleEditLedger}
              updateLedgerMutation={updateLedgerMutation}
              onOpenChange={() => setEditingLedger(null)}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer
          open={!!editingLedger}
          onOpenChange={() => setEditingLedger(null)}
        >
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Edit Ledger</DrawerTitle>
              <DrawerDescription>
                Update the details for "{editingLedger?.name}"
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <EditLedgerForm
                form={form}
                onSubmit={handleEditLedger}
                updateLedgerMutation={updateLedgerMutation}
                onOpenChange={() => setEditingLedger(null)}
                showCancelButton={false}
              />
            </div>
            <DrawerFooter className="pt-2 flex flex-row gap-2">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                disabled={updateLedgerMutation.isPending}
                className="bg-primary hover:bg-primary/90 flex-1"
                onClick={() => {
                  form.handleSubmit(handleEditLedger)();
                }}
              >
                {updateLedgerMutation.isPending
                  ? "Saving changes..."
                  : "Update Ledger"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

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
          <AlertDialogFooter className="flex flex-row gap-2">
            <AlertDialogCancel
              disabled={deleteLedgerMutation.isPending}
              className="flex-1"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLedger}
              disabled={deleteLedgerMutation.isPending}
              className="bg-red-600 hover:bg-red-700 flex-1"
            >
              {deleteLedgerMutation.isPending ? "Removing..." : "Delete Ledger"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
