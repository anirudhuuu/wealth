"use client";

import { LedgersList } from "@/components/ledgers/ledgers-list";
import { LedgersSkeleton } from "@/components/ledgers/ledgers-skeleton";
import { TransactionsList } from "@/components/ledgers/transactions-list";
import { SandboxBanner } from "@/components/sandbox-banner";
import { useLedgers } from "@/hooks/use-ledgers";
import { useTransactions } from "@/hooks/use-transactions";
import { useUserWithProfile } from "@/hooks/use-user";

export default function LedgersPage() {
  const { user, isLoading: userLoading, isAdmin } = useUserWithProfile();
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Ledgers & Transactions
            </h1>
            <p className="text-muted-foreground">
              Manage your financial ledgers and track transactions
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Ledgers & Transactions
            </h1>
            <p className="text-muted-foreground">
              Manage your financial ledgers and track transactions
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Please sign in to view your ledgers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Ledgers & Transactions
          </h1>
          <p className="text-muted-foreground">
            Manage your financial ledgers and track transactions
          </p>
        </div>
      </div>

      {!isAdmin && <SandboxBanner />}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ledgers Section */}
        <div className="lg:col-span-1">
          <LedgersList
            ledgers={ledgers}
            transactions={transactions}
            isAdmin={isAdmin}
          />
        </div>

        {/* Transactions Section */}
        <div className="lg:col-span-2">
          <TransactionsList
            transactions={transactions}
            ledgers={ledgers}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  );
}
