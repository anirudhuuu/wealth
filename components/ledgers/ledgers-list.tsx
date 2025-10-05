"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Wallet } from "lucide-react"
import type { Ledger } from "@/lib/types"
import { AddLedgerDialog } from "./add-ledger-dialog"
import { useState } from "react"

interface LedgersListProps {
  ledgers: Ledger[]
  isAdmin: boolean
}

export function LedgersList({ ledgers, isAdmin }: LedgersListProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)

  const getLedgerTypeColor = (type: string) => {
    switch (type) {
      case "family":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
      case "personal":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      case "loan":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ledgers</CardTitle>
            {isAdmin && (
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ledgers.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <Wallet className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No ledgers yet</p>
                {isAdmin && <p className="mt-1">Create your first ledger to get started</p>}
              </div>
            ) : (
              ledgers.map((ledger) => (
                <div key={ledger.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="font-medium">{ledger.name}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getLedgerTypeColor(ledger.type)}`}
                      >
                        {ledger.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{ledger.currency}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {isAdmin && <AddLedgerDialog open={showAddDialog} onOpenChange={setShowAddDialog} />}
    </>
  )
}
