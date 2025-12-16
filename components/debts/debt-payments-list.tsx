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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useDeletePayment } from "@/hooks/use-debts";
import type { DebtPayment } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useState } from "react";

interface DebtPaymentsListProps {
  debtId: string;
  payments: DebtPayment[];
  currency: string;
}

export function DebtPaymentsList({
  debtId,
  payments,
  currency,
}: DebtPaymentsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(
    null
  );
  const deletePaymentMutation = useDeletePayment();

  const sortedPayments = [...payments].sort(
    (a, b) =>
      new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
  );

  const handleDeletePayment = async (paymentId: string) => {
    setDeletingPaymentId(paymentId);
    deletePaymentMutation.mutate(
      { id: paymentId, debtId },
      {
        onSettled: () => {
          setDeletingPaymentId(null);
        },
      }
    );
  };

  if (payments.length === 0) {
    return (
      <div className="border-t pt-3 mt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <span className="text-sm text-muted-foreground">Payments (0)</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {isExpanded && (
          <div className="mt-2">
            <Empty>
              <EmptyMedia variant="icon">
                <Trash2 className="h-6 w-6 opacity-50" />
              </EmptyMedia>
              <EmptyContent>
                <EmptyTitle>No payments yet</EmptyTitle>
                <EmptyDescription>
                  Record your first payment to start tracking debt payoff
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-t pt-3 mt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between"
      >
        <span className="text-sm font-medium">
          Payments ({payments.length})
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
          {sortedPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-2 rounded-md border bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">
                    {formatCurrency(Number(payment.amount), currency)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatDate(payment.payment_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Principal:{" "}
                    {formatCurrency(Number(payment.principal_paid), currency)}
                  </span>
                  <span>•</span>
                  <span>
                    Interest:{" "}
                    {formatCurrency(Number(payment.interest_paid), currency)}
                  </span>
                </div>
                {payment.notes && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {payment.notes}
                  </p>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10 ml-2 shrink-0"
                    title="Delete payment"
                    disabled={deletingPaymentId === payment.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this payment of{" "}
                      {formatCurrency(Number(payment.amount), currency)}? This
                      will remove it from the debt and update the balance.
                      <br />
                      <br />
                      <strong>This action cannot be undone.</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex flex-row gap-2">
                    <AlertDialogCancel
                      disabled={deletingPaymentId === payment.id}
                      className="flex-1"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeletePayment(payment.id)}
                      disabled={deletingPaymentId === payment.id}
                      className="bg-red-600 hover:bg-red-700 flex-1"
                    >
                      {deletingPaymentId === payment.id
                        ? "Deleting..."
                        : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
