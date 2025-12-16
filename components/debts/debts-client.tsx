"use client";

import { DebtsList } from "@/components/debts/debts-list";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Debt, Ledger } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

interface DebtsClientProps {
  user: User;
  debts: Debt[];
  ledgers: Ledger[];
}

export function DebtsClient({ user, debts, ledgers }: DebtsClientProps) {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Summary</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Debts</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Debts & Loans</h1>
          <p className="text-muted-foreground">
            Track and manage your debts with payoff strategies and payment
            scheduling
          </p>
        </div>
      </div>

      {/* Debts List */}
      <div>
        <DebtsList debts={debts} ledgers={ledgers} />
      </div>
    </div>
  );
}
