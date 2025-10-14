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
import { useUpdateAsset } from "@/hooks/use-assets";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { Asset } from "@/lib/types";
import { parseAndRoundAmount, parseDateFromDatabase } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Validation schema
const assetSchema = z.object({
  name: z
    .string()
    .min(1, "Asset name is required")
    .max(255, "Asset name must be less than 255 characters"),
  type: z.enum([
    "fd",
    "mutual_fund",
    "stock",
    "gold",
    "real_estate",
    "crypto",
    "other",
  ]),
  currentValue: z
    .string()
    .min(1, "Current value is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, "Current value must be a non-negative number"),
  purchaseValue: z
    .string()
    .min(1, "Purchase value is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, "Purchase value must be a non-negative number"),
  purchaseDate: z.date({
    message: "Purchase date is required",
  }),
  maturityDate: z.date().optional(),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]),
  notes: z.string().optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

// Reusable form component for editing assets
function EditAssetForm({
  form,
  onSubmit,
  updateAssetMutation,
  onOpenChange,
  className,
  showCancelButton = true,
}: {
  form: any;
  onSubmit: (data: AssetFormData) => void;
  updateAssetMutation: any;
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
              <FormLabel>Asset Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter asset name" {...field} />
              </FormControl>
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
                <FormLabel>Asset Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="fd">Fixed Deposit</SelectItem>
                    <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                <FormLabel>Currency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Value</FormLabel>
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
            name="purchaseValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Value</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select purchase date"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maturityDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maturity Date (Optional)</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select maturity date"
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
                  placeholder="Add any additional notes about this asset"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={updateAssetMutation.isPending}>
            {updateAssetMutation.isPending ? "Updating..." : "Update Asset"}
          </Button>
          {showCancelButton && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateAssetMutation.isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

interface EditAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}

export function EditAssetDialog({
  open,
  onOpenChange,
  asset,
}: EditAssetDialogProps) {
  const updateAssetMutation = useUpdateAsset();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      type: "fd",
      currentValue: "",
      purchaseValue: "",
      purchaseDate: new Date(),
      maturityDate: undefined,
      currency: "INR",
      notes: "",
    },
  });

  // Update form when asset changes
  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset.name,
        type: asset.type as any,
        currentValue: asset.current_value?.toString() || "0",
        purchaseValue: asset.purchase_value?.toString() || "0",
        purchaseDate: asset.purchase_date
          ? parseDateFromDatabase(asset.purchase_date)
          : new Date(),
        maturityDate: asset.maturity_date
          ? parseDateFromDatabase(asset.maturity_date)
          : undefined,
        currency: asset.currency as any,
        notes: asset.notes || "",
      });
    }
  }, [asset, form]);

  const onSubmit = async (data: AssetFormData) => {
    if (!asset) return;

    updateAssetMutation.mutate(
      {
        id: asset.id,
        input: {
          name: data.name,
          type: data.type,
          currentValue: parseAndRoundAmount(data.currentValue),
          purchaseValue: data.purchaseValue
            ? parseAndRoundAmount(data.purchaseValue)
            : null,
          purchaseDate: data.purchaseDate,
          maturityDate: data.maturityDate,
          currency: data.currency,
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
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update the details for this asset.
            </DialogDescription>
          </DialogHeader>
          <EditAssetForm
            form={form}
            onSubmit={onSubmit}
            updateAssetMutation={updateAssetMutation}
            onOpenChange={onOpenChange}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Asset</DrawerTitle>
          <DrawerDescription>
            Update the details for this asset.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 overflow-y-auto flex-1">
          <EditAssetForm
            form={form}
            onSubmit={onSubmit}
            updateAssetMutation={updateAssetMutation}
            onOpenChange={onOpenChange}
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
