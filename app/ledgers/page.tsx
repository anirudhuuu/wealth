import { LedgersClient } from "@/components/ledgers/ledgers-client";
import { getLedgers } from "@/lib/actions/ledger-actions";
import { getTransactions } from "@/lib/actions/transaction-actions";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LedgersPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [ledgers, transactions] = await Promise.all([
    getLedgers(),
    getTransactions(),
  ]);

  return (
    <LedgersClient user={user} ledgers={ledgers} transactions={transactions} />
  );
}
