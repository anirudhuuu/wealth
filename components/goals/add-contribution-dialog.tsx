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
import { useAddContribution } from "@/hooks/use-goals";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Goal } from "@/lib/types";
import { parseAndRoundAmount } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Validation schema
const contributionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Amount must be greater than 0"),
  date: z.date({
    message: "Date is required",
  }),
  notes: z.string().optional(),
});

type ContributionFormData = z.infer<typeof contributionSchema>;

// Reusable form component for adding contributions
function ContributionForm({
  form,
  onSubmit,
  addContributionMutation,
  onOpenChange,
  className,
  showCancelButton = true,
}: {
  form: UseFormReturn<ContributionFormData>;
  onSubmit: (data: ContributionFormData) => void;
  addContributionMutation: ReturnType<typeof useAddContribution>;
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contribution Amount</FormLabel>
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
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
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

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes about this contribution..."
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
              disabled={addContributionMutation.isPending}
              className="flex-1"
            >
              {addContributionMutation.isPending
                ? "Adding..."
                : "Add Contribution"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={addContributionMutation.isPending}
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

interface AddContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

export function AddContributionDialog({
  open,
  onOpenChange,
  goal,
}: AddContributionDialogProps) {
  const addContributionMutation = useAddContribution();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: "",
      date: new Date(),
      notes: "",
    },
  });

  const onSubmit = async (data: ContributionFormData) => {
    if (!goal) return;

    addContributionMutation.mutate(
      {
        goalId: goal.id,
        amount: parseAndRoundAmount(data.amount),
        date: data.date,
        notes: data.notes || null,
      },
      {
        onSuccess: () => {
          form.reset({
            amount: "",
            date: new Date(),
            notes: "",
          });
          onOpenChange(false);
        },
      }
    );
  };

  if (!goal) return null;

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
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Add money to "{goal.name}" to track your progress.
            </DialogDescription>
          </DialogHeader>
          <ContributionForm
            form={form}
            onSubmit={onSubmit}
            addContributionMutation={addContributionMutation}
            onOpenChange={onOpenChange}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Contribution</DrawerTitle>
          <DrawerDescription>
            Add money to "{goal.name}" to track your progress.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto flex-1">
          <ContributionForm
            form={form}
            onSubmit={onSubmit}
            addContributionMutation={addContributionMutation}
            onOpenChange={onOpenChange}
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
            disabled={addContributionMutation.isPending}
            className="flex-1"
            onClick={() => {
              form.handleSubmit(onSubmit)();
            }}
          >
            {addContributionMutation.isPending
              ? "Adding..."
              : "Add Contribution"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
