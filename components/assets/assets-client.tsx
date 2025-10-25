"use client";

import { AssetsList } from "@/components/assets/assets-list";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Asset } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

interface AssetsClientProps {
  user: User;
  assets: Asset[];
}

export function AssetsClient({ user, assets }: AssetsClientProps) {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Summary</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Savings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Savings & Investments
          </h1>
          <p className="text-muted-foreground">
            Manage your investments and track performance
          </p>
        </div>
      </div>

      {/* Savings List */}
      <div>
        <AssetsList assets={assets} />
      </div>
    </div>
  );
}
