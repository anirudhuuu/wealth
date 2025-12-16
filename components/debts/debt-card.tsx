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
import { Progress } from "@/components/ui/progress";
import { useDeleteDebt, useDebtPayments } from "@/hooks/use-debts";
import type { Debt } from "@/lib/types";
import { formatCurrency, formatDate, parseDateFromDatabase } from "@/lib/utils";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddPaymentDialog } from "./add-payment-dialog";
import { DebtPaymentsList } from "./debt-payments-list";
import { EditDebtDialog } from "./edit-debt-dialog";

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  ledgers: Array<{ id: string; name: string; type: string }>;
}

export function DebtCard({ debt, onEdit, ledgers }: DebtCardProps) {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deletingDebtId, setDeletingDebtId] = useState<string | null>(null);
  const deleteDebtMutation = useDeleteDebt();
  const { data: payments = [] } = useDebtPayments(debt.id);

  const principalAmount = Number(debt.principal_amount);
  const currentBalance = Number(debt.current_balance);
  const percentagePaid =
    principalAmount > 0
      ? ((principalAmount - currentBalance) / principalAmount) * 100
      : 0;
  const amountRemaining = Math.max(0, currentBalance);
  const isPaidOff = currentBalance <= 0;

  const nextPaymentDate = debt.next_payment_date
    ? parseDateFromDatabase(debt.next_payment_date)
    : null;
  const daysUntilPayment =
    nextPaymentDate && !isPaidOff
      ? Math.ceil(
          (nextPaymentDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid_off":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "defaulted":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      case "paused":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    setDeletingDebtId(debtId);
    deleteDebtMutation.mutate(debtId, {
      onSettled: () => {
        setDeletingDebtId(null);
      },
    });
  };

  const linkedLedger = debt.ledger_id
    ? ledgers.find((l) => l.id === debt.ledger_id)
    : null;

  return (
    <>
      <div className="rounded-lg border p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{debt.name}</h3>
            {debt.creditor_name && (
              <p className="text-sm text-muted-foreground mt-1">
                {debt.creditor_name}
              </p>
            )}
            {linkedLedger && (
              <p className="text-xs text-muted-foreground mt-1">
                Linked to: {linkedLedger.name}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`ml-2 shrink-0 ${getStatusColor(debt.status)}`}
          >
            {debt.status.charAt(0).toUpperCase() + debt.status.slice(1)}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{percentagePaid.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(100, Math.max(0, percentagePaid))} />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(currentBalance, debt.currency)} /{" "}
              {formatCurrency(principalAmount, debt.currency)}
            </span>
            <span className="text-muted-foreground">
              {formatCurrency(amountRemaining, debt.currency)} remaining
            </span>
          </div>
        </div>

        {/* Debt Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Interest Rate:</span>
            <span className="font-medium">{debt.interest_rate}%</span>
          </div>
          {debt.minimum_payment && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Minimum Payment:</span>
              <span className="font-medium">
                {formatCurrency(Number(debt.minimum_payment), debt.currency)}
              </span>
            </div>
          )}
          {nextPaymentDate && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Next Payment:</span>
              <div className="text-right">
                <span className="font-medium">
                  {formatDate(nextPaymentDate)}
                </span>
                {daysUntilPayment !== null && (
                  <span
                    className={`ml-2 text-xs ${
                      daysUntilPayment < 0
                        ? "text-destructive"
                        : daysUntilPayment < 7
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    (
                    {daysUntilPayment < 0
                      ? "Overdue"
                      : `${daysUntilPayment} days`}
                    )
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payments Made:</span>
            <span className="font-medium">{payments.length}</span>
          </div>
        </div>

        {/* Payments List */}
        <DebtPaymentsList
          debtId={debt.id}
          payments={payments}
          currency={debt.currency}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPayment(true)}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEditDialog(true)}
            className="h-8 w-8 p-0"
            title="Edit debt"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                title="Delete debt"
                disabled={deletingDebtId === debt.id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Debt</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{debt.name}"? This will
                  permanently delete the debt and all its payment history.
                  <br />
                  <br />
                  <strong>This action cannot be undone.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-row gap-2">
                <AlertDialogCancel
                  disabled={deletingDebtId === debt.id}
                  className="flex-1"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteDebt(debt.id)}
                  disabled={deletingDebtId === debt.id}
                  className="bg-red-600 hover:bg-red-700 flex-1"
                >
                  {deletingDebtId === debt.id ? "Deleting..." : "Delete Debt"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <AddPaymentDialog
        open={showAddPayment}
        onOpenChange={setShowAddPayment}
        debt={debt}
      />

      <EditDebtDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        debt={debt}
        ledgers={ledgers}
      />
    </>
  );
}
