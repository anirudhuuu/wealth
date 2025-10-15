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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUpdateTransaction } from "@/hooks/use-transactions";
import type { Ledger, Transaction } from "@/lib/types";
import { parseAndRoundAmount, parseDateFromDatabase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Validation schema (same as add transaction)
const transactionSchema = z.object({
  ledger_id: z.string().min(1, "Please select a budget book"),
  date: z.date({
    message: "Date is required",
  }),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description must be less than 255 characters"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be less than 100 characters"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be a positive number"),
  type: z.enum(["income", "expense"]),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

// Reusable form component for editing transactions
function EditTransactionForm({
  form,
  onSubmit,
  updateTransactionMutation,
  onOpenChange,
  ledgers,
  className,
  showCancelButton = true,
}: {
  form: UseFormReturn<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => void;
  updateTransactionMutation: ReturnType<typeof useUpdateTransaction>;
  onOpenChange: (open: boolean) => void;
  ledgers: Ledger[];
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
          name="ledger_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a budget book" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ledgers.map((ledger) => (
                    <SelectItem
                      key={ledger.id}
                      value={ledger.id}
                      className="truncate"
                    >
                      <span className="truncate" title={ledger.name}>
                        {ledger.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₹)</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select transaction date"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Grocery shopping" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Food & Dining, Transport, Entertainment"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={updateTransactionMutation.isPending}>
            {updateTransactionMutation.isPending
              ? "Saving changes..."
              : "Update Payment"}
          </Button>
          {showCancelButton && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateTransactionMutation.isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  ledgers: Ledger[];
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
  ledgers,
}: EditTransactionDialogProps) {
  const updateTransactionMutation = useUpdateTransaction();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      ledger_id: "",
      date: new Date(),
      description: "",
      category: "",
      amount: "",
      type: "expense",
      notes: "",
    },
  });

  // Populate form when transaction changes
  useEffect(() => {
    if (transaction) {
      form.reset({
        ledger_id: transaction.ledger_id,
        date: parseDateFromDatabase(transaction.date),
        description: transaction.description,
        category: transaction.category,
        amount: transaction.amount.toString(),
        type: transaction.type,
        notes: transaction.notes || "",
      });
    }
  }, [transaction, form]);

  const onSubmit = async (data: TransactionFormData) => {
    if (!transaction) return;

    updateTransactionMutation.mutate(
      {
        id: transaction.id,
        input: {
          ledgerId: data.ledger_id,
          date: data.date,
          description: data.description,
          category: data.category,
          amount: parseAndRoundAmount(data.amount),
          type: data.type,
          notes: data.notes || null,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

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
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>
              Update the details for this payment.
            </DialogDescription>
          </DialogHeader>
          <EditTransactionForm
            form={form}
            onSubmit={onSubmit}
            updateTransactionMutation={updateTransactionMutation}
            onOpenChange={onOpenChange}
            ledgers={ledgers}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Payment</DrawerTitle>
          <DrawerDescription>
            Update the details for this payment.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto flex-1">
          <EditTransactionForm
            form={form}
            onSubmit={onSubmit}
            updateTransactionMutation={updateTransactionMutation}
            onOpenChange={onOpenChange}
            ledgers={ledgers}
            showCancelButton={false}
          />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
