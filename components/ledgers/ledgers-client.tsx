"use client";

import { LedgersList } from "@/components/ledgers/ledgers-list";
import { TransactionsList } from "@/components/ledgers/transactions-list";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Ledger, Transaction } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

interface LedgersClientProps {
  user: User;
  ledgers: Ledger[];
  transactions: Transaction[];
}

export function LedgersClient({
  user,
  ledgers,
  transactions,
}: LedgersClientProps) {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Summary</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Ledgers</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ledgers</h1>
          <p className="text-muted-foreground">
            Manage your financial ledgers and track payments
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ledgers Section */}
        <div className="lg:col-span-1">
          <LedgersList ledgers={ledgers} transactions={transactions} />
        </div>

        {/* Payments Section */}
        <div className="lg:col-span-2">
          <TransactionsList transactions={transactions} ledgers={ledgers} />
        </div>
      </div>
    </div>
  );
}
