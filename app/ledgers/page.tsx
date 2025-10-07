import { LedgersList } from "@/components/ledgers/ledgers-list";
import { TransactionsList } from "@/components/ledgers/transactions-list";
import { SandboxBanner } from "@/components/sandbox-banner";
import { getProfile, requireAuth } from "@/lib/auth";
import {
  generateSandboxLedgers,
  generateSandboxTransactions,
} from "@/lib/sandbox";
import { createClient } from "@/lib/supabase/server";

export default async function LedgersPage() {
  const user = await requireAuth();
  const profile = await getProfile(user.id);
  const isAdmin = profile?.is_admin ?? false;

  let ledgers = [];
  let transactions = [];

  if (isAdmin) {
    const supabase = await createClient();

    const { data: ledgerData } = await supabase
      .from("ledgers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    ledgers = ledgerData || [];

    const { data: txnData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(100);

    transactions = txnData || [];
  } else {
    ledgers = generateSandboxLedgers();
    transactions = generateSandboxTransactions();
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
