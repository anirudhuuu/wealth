"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { useAddPayment, useDebtPayments } from "@/hooks/use-debts";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Debt } from "@/lib/types";
import {
  formatCurrency,
  parseAndRoundAmount,
  parseDateFromDatabase,
} from "@/lib/utils";
import { calculatePaymentSplit } from "@/lib/utils/interest-calculations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Validation schema
const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be greater than 0"),
  paymentDate: z.date({
    message: "Date is required",
  }),
  principalPaid: z.string().optional(),
  interestPaid: z.string().optional(),
  isScheduled: z.boolean().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

// Reusable form component for adding payments
function PaymentForm({
  form,
  onSubmit,
  addPaymentMutation,
  onOpenChange,
  debt,
  lastPaymentDate,
  className,
  showCancelButton = true,
}: {
  form: UseFormReturn<PaymentFormData>;
  onSubmit: (data: PaymentFormData) => void;
  addPaymentMutation: ReturnType<typeof useAddPayment>;
  onOpenChange: (open: boolean) => void;
  debt: Debt;
  lastPaymentDate: Date | null;
  className?: string;
  showCancelButton?: boolean;
}) {
  const amount = form.watch("amount");
  const paymentDate = form.watch("paymentDate");

  // Auto-calculate principal/interest split
  const split = useMemo(() => {
    if (!amount || !paymentDate || !lastPaymentDate) {
      return { principalPaid: 0, interestPaid: 0 };
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return { principalPaid: 0, interestPaid: 0 };
    }

    const daysSinceLastPayment = Math.max(
      0,
      Math.ceil(
        (paymentDate.getTime() - lastPaymentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    const currentBalance = Number(debt.current_balance);
    const split = calculatePaymentSplit(
      paymentAmount,
      currentBalance,
      Number(debt.interest_rate),
      debt.interest_type,
      debt.compounding_frequency,
      daysSinceLastPayment
    );

    return split;
  }, [amount, paymentDate, lastPaymentDate, debt]);

  // Update form when split changes
  useEffect(() => {
    if (split.principalPaid > 0 || split.interestPaid > 0) {
      form.setValue("principalPaid", split.principalPaid.toString(), {
        shouldValidate: false,
      });
      form.setValue("interestPaid", split.interestPaid.toString(), {
        shouldValidate: false,
      });
    }
  }, [split, form]);

  const newBalance = useMemo(() => {
    if (!amount) return Number(debt.current_balance);
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount)) return Number(debt.current_balance);
    return Math.max(0, Number(debt.current_balance) - split.principalPaid);
  }, [amount, debt.current_balance, split.principalPaid]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-4 ${className || ""}`}
      >
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Auto-calculated split display */}
        {amount && parseFloat(amount) > 0 && (
          <div className="p-3 bg-muted rounded-md space-y-2">
            <div className="text-sm font-medium">Payment Breakdown</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Principal: </span>
                <span className="font-medium">
                  {formatCurrency(split.principalPaid, debt.currency)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Interest: </span>
                <span className="font-medium">
                  {formatCurrency(split.interestPaid, debt.currency)}
                </span>
              </div>
            </div>
            <div className="text-sm pt-2 border-t">
              <span className="text-muted-foreground">New Balance: </span>
              <span className="font-semibold">
                {formatCurrency(newBalance, debt.currency)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="principalPaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Principal Paid (Auto-calculated)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interestPaid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Paid (Auto-calculated)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    readOnly
                    className="bg-muted"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes about this payment..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCancelButton && (
          <div className="flex flex-row gap-2">
            <Button
              type="submit"
              disabled={addPaymentMutation.isPending}
              className="flex-1"
            >
              {addPaymentMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addPaymentMutation.isPending}
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

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: Debt | null;
}

export function AddPaymentDialog({
  open,
  onOpenChange,
  debt,
}: AddPaymentDialogProps) {
  const addPaymentMutation = useAddPayment();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data: payments = [] } = useDebtPayments(debt?.id || "");

  // Get last payment date for interest calculation
  const lastPaymentDate = useMemo(() => {
    if (!debt || payments.length === 0) {
      return debt ? parseDateFromDatabase(debt.start_date) : null;
    }
    const sortedPayments = [...payments].sort(
      (a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );
    return parseDateFromDatabase(sortedPayments[0].payment_date);
  }, [debt, payments]);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "",
      paymentDate: new Date(),
      principalPaid: "",
      interestPaid: "",
      isScheduled: false,
      notes: "",
    },
  });

  // Calculate split for submission
  const amount = form.watch("amount");
  const paymentDate = form.watch("paymentDate");
  const split = useMemo(() => {
    if (!debt || !amount || !paymentDate || !lastPaymentDate) {
      return { principalPaid: 0, interestPaid: 0 };
    }
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return { principalPaid: 0, interestPaid: 0 };
    }
    const daysSinceLastPayment = Math.max(
      0,
      Math.ceil(
        (paymentDate.getTime() - lastPaymentDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    return calculatePaymentSplit(
      paymentAmount,
      Number(debt.current_balance),
      Number(debt.interest_rate),
      debt.interest_type,
      debt.compounding_frequency,
      daysSinceLastPayment
    );
  }, [amount, paymentDate, lastPaymentDate, debt]);

  const onSubmit = async (data: PaymentFormData) => {
    if (!debt) return;

    const principalPaid = data.principalPaid
      ? parseAndRoundAmount(data.principalPaid)
      : split.principalPaid;
    const interestPaid = data.interestPaid
      ? parseAndRoundAmount(data.interestPaid)
      : split.interestPaid;

    addPaymentMutation.mutate(
      {
        debtId: debt.id,
        amount: parseAndRoundAmount(data.amount),
        principalPaid,
        interestPaid,
        paymentDate: data.paymentDate,
        isScheduled: data.isScheduled || false,
        notes: data.notes || null,
      },
      {
        onSuccess: () => {
          form.reset({
            amount: "",
            paymentDate: new Date(),
            principalPaid: "",
            interestPaid: "",
            isScheduled: false,
            notes: "",
          });
          onOpenChange(false);
        },
      }
    );
  };

  if (!debt) return null;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          showCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for "{debt.name}". Principal and interest will be
              auto-calculated.
            </DialogDescription>
          </DialogHeader>
          <PaymentForm
            form={form}
            onSubmit={onSubmit}
            addPaymentMutation={addPaymentMutation}
            onOpenChange={onOpenChange}
            debt={debt}
            lastPaymentDate={lastPaymentDate}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Record Payment</DrawerTitle>
          <DrawerDescription>
            Record a payment for "{debt.name}". Principal and interest will be
            auto-calculated.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto flex-1">
          <PaymentForm
            form={form}
            onSubmit={onSubmit}
            addPaymentMutation={addPaymentMutation}
            onOpenChange={onOpenChange}
            debt={debt}
            lastPaymentDate={lastPaymentDate}
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
            disabled={addPaymentMutation.isPending}
            className="flex-1"
            onClick={() => {
              form.handleSubmit(onSubmit)();
            }}
          >
            {addPaymentMutation.isPending ? "Recording..." : "Record Payment"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
