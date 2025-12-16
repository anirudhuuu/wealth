import { DebtsClient } from "@/components/debts/debts-client";
import { getDebts } from "@/lib/actions/debt-actions";
import { getLedgers } from "@/lib/actions/ledger-actions";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DebtsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [debts, ledgers] = await Promise.all([getDebts(), getLedgers()]);

  return <DebtsClient user={user} debts={debts} ledgers={ledgers} />;
}
