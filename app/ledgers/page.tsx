"use client";

import { LedgersList } from "@/components/ledgers/ledgers-list";
import { LedgersSkeleton } from "@/components/ledgers/ledgers-skeleton";
import { TransactionsList } from "@/components/ledgers/transactions-list";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLedgers } from "@/hooks/use-ledgers";
import { useTransactions } from "@/hooks/use-transactions";
import { useUserWithProfile } from "@/hooks/use-user";

export default function LedgersPage() {
  const { user, isLoading: userLoading } = useUserWithProfile();
  const {
    data: ledgers = [],
    isLoading: ledgersLoading,
    error: ledgersError,
  } = useLedgers();
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useTransactions();

  const isLoading = userLoading || ledgersLoading || transactionsLoading;
  const error = ledgersError || transactionsError;

  if (isLoading) {
    return <LedgersSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Summary</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Budget Books</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget Books</h1>
            <p className="text-muted-foreground">
              Manage your budget books and track payments
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600">
            Failed to load ledgers data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Summary</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Budget Books</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget Books</h1>
            <p className="text-muted-foreground">
              Manage your budget books and track payments
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Please sign in to view your budget books.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Summary</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Budget Books</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Books</h1>
          <p className="text-muted-foreground">
            Manage your financial ledgers and track payments
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Budget Books Section */}
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
