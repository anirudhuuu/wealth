"use client";

import { Button } from "@/components/ui/button";
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
import { useCreateLedger } from "@/hooks/use-ledgers";
import { useMediaQuery } from "@/hooks/use-media-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Validation schema
const ledgerSchema = z.object({
  name: z
    .string()
    .min(1, "Budget name is required")
    .max(100, "Budget name must be less than 100 characters"),
  type: z.enum(["family", "personal", "loan"]),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]),
});

type LedgerFormData = z.infer<typeof ledgerSchema>;

interface AddLedgerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Form component that can be reused in both dialog and drawer
function LedgerForm({
  form,
  onSubmit,
  createLedgerMutation,
  onOpenChange,
  className,
  showCancelButton = true,
}: {
  form: UseFormReturn<LedgerFormData>;
  onSubmit: (data: LedgerFormData) => void;
  createLedgerMutation: ReturnType<typeof useCreateLedger>;
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
                <Input placeholder="e.g., My Family Account" {...field} />
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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
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
        </div>

        {showCancelButton && (
          <div className="flex flex-row gap-2">
            <Button
              type="submit"
              disabled={createLedgerMutation.isPending}
              className="flex-1"
            >
              {createLedgerMutation.isPending
                ? "Saving..."
                : "Create Budget Book"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createLedgerMutation.isPending}
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

export function AddLedgerDialog({ open, onOpenChange }: AddLedgerDialogProps) {
  const createLedgerMutation = useCreateLedger();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<LedgerFormData>({
    resolver: zodResolver(ledgerSchema),
    defaultValues: {
      name: "",
      type: "personal",
      currency: "INR",
    },
  });

  const onSubmit = async (data: LedgerFormData) => {
    createLedgerMutation.mutate(
      {
        name: data.name,
        type: data.type,
        currency: data.currency,
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
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          showCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle>Add New Budget Book</DialogTitle>
            <DialogDescription>
              Create a new budget book to track your financial transactions.
            </DialogDescription>
          </DialogHeader>
          <LedgerForm
            form={form}
            onSubmit={onSubmit}
            createLedgerMutation={createLedgerMutation}
            onOpenChange={onOpenChange}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add New Budget Book</DrawerTitle>
          <DrawerDescription>
            Create a new budget book to track your financial transactions.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <LedgerForm
            form={form}
            onSubmit={onSubmit}
            createLedgerMutation={createLedgerMutation}
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
            disabled={createLedgerMutation.isPending}
            className="flex-1"
            onClick={() => {
              form.handleSubmit(onSubmit)();
            }}
          >
            {createLedgerMutation.isPending
              ? "Saving..."
              : "Create Budget Book"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
