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
import { useCreateDebt } from "@/hooks/use-debts";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Ledger } from "@/lib/types";
import { parseAndRoundAmount } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Validation schema
const debtSchema = z.object({
  ledgerId: z.string().optional(),
  name: z
    .string()
    .min(1, "Debt name is required")
    .max(255, "Debt name must be less than 255 characters"),
  creditorName: z.string().optional(),
  principalAmount: z
    .string()
    .min(1, "Principal amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Principal amount must be greater than 0"),
  interestRate: z
    .string()
    .min(1, "Interest rate is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, "Interest rate must be between 0 and 100"),
  interestType: z.enum(["simple", "compound", "fixed", "variable"]),
  compoundingFrequency: z.enum(["daily", "monthly", "yearly"]).optional(),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]),
  startDate: z.date({
    message: "Start date is required",
  }),
  maturityDate: z.date().optional(),
  minimumPayment: z.string().optional(),
  paymentFrequency: z.enum(["weekly", "biweekly", "monthly", "yearly"]),
  nextPaymentDate: z.date().optional(),
  payoffStrategy: z.enum(["snowball", "avalanche", "custom", "minimum_only"]),
  notes: z.string().optional(),
});

type DebtFormData = z.infer<typeof debtSchema>;

// Reusable form component for adding debts
function DebtForm({
  form,
  onSubmit,
  createDebtMutation,
  onOpenChange,
  ledgers,
  className,
  showCancelButton = true,
}: {
  form: UseFormReturn<DebtFormData>;
  onSubmit: (data: DebtFormData) => void;
  createDebtMutation: ReturnType<typeof useCreateDebt>;
  onOpenChange: (open: boolean) => void;
  ledgers: Ledger[];
  className?: string;
  showCancelButton?: boolean;
}) {
  const interestType = form.watch("interestType");

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
              <FormLabel>Debt Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Credit Card, Home Loan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creditorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Creditor/Lender (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Bank Name, Credit Card Company"
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
            name="principalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Principal Amount</FormLabel>
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
            name="interestRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
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

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="interestType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="compound">Compound</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="variable">Variable</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {interestType === "compound" && (
            <FormField
              control={form.control}
              name="compoundingFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compounding Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
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

          <FormField
            control={form.control}
            name="paymentFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Frequency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select start date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextPaymentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Payment Date (Optional)</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select next payment date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="minimumPayment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Payment (Optional)</FormLabel>
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
            name="payoffStrategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payoff Strategy</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="minimum_only">Minimum Only</SelectItem>
                    <SelectItem value="snowball">Snowball</SelectItem>
                    <SelectItem value="avalanche">Avalanche</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="ledgerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link to Loan Ledger (Optional)</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "__none__" ? "" : value)
                }
                value={field.value || "__none__"}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select ledger (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {ledgers
                    .filter((l) => l.type === "loan")
                    .map((ledger) => (
                      <SelectItem key={ledger.id} value={ledger.id}>
                        {ledger.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
                <Textarea
                  placeholder="Additional details about this debt..."
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
              disabled={createDebtMutation.isPending}
              className="flex-1"
            >
              {createDebtMutation.isPending ? "Creating..." : "Create Debt"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createDebtMutation.isPending}
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

interface AddDebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ledgers: Ledger[];
}

export function AddDebtDialog({
  open,
  onOpenChange,
  ledgers,
}: AddDebtDialogProps) {
  const createDebtMutation = useCreateDebt();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      ledgerId: "",
      name: "",
      creditorName: "",
      principalAmount: "",
      interestRate: "",
      interestType: "simple",
      compoundingFrequency: undefined,
      currency: "INR",
      startDate: new Date(),
      maturityDate: undefined,
      minimumPayment: "",
      paymentFrequency: "monthly",
      nextPaymentDate: undefined,
      payoffStrategy: "minimum_only",
      notes: "",
    },
  });

  const onSubmit = async (data: DebtFormData) => {
    createDebtMutation.mutate(
      {
        ledgerId: data.ledgerId || null,
        name: data.name,
        creditorName: data.creditorName || null,
        principalAmount: parseAndRoundAmount(data.principalAmount),
        interestRate: parseFloat(data.interestRate),
        interestType: data.interestType,
        compoundingFrequency:
          data.interestType === "compound"
            ? data.compoundingFrequency || "monthly"
            : null,
        currency: data.currency,
        startDate: data.startDate,
        maturityDate: data.maturityDate || null,
        minimumPayment: data.minimumPayment
          ? parseAndRoundAmount(data.minimumPayment)
          : null,
        paymentFrequency: data.paymentFrequency,
        nextPaymentDate: data.nextPaymentDate || null,
        payoffStrategy: data.payoffStrategy,
        notes: data.notes || null,
      },
      {
        onSuccess: () => {
          form.reset();
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
            <DialogTitle>Create New Debt</DialogTitle>
            <DialogDescription>
              Add a new debt or loan to track and manage payments.
            </DialogDescription>
          </DialogHeader>
          <DebtForm
            form={form}
            onSubmit={onSubmit}
            createDebtMutation={createDebtMutation}
            onOpenChange={onOpenChange}
            ledgers={ledgers}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Create New Debt</DrawerTitle>
          <DrawerDescription>
            Add a new debt or loan to track and manage payments.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto flex-1">
          <DebtForm
            form={form}
            onSubmit={onSubmit}
            createDebtMutation={createDebtMutation}
            onOpenChange={onOpenChange}
            ledgers={ledgers}
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
            disabled={createDebtMutation.isPending}
            className="flex-1"
            onClick={() => {
              form.handleSubmit(onSubmit)();
            }}
          >
            {createDebtMutation.isPending ? "Creating..." : "Create Debt"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
