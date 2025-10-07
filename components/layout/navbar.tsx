"use client";

import { signOut } from "@/app/actions/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { LogOut, Wallet } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Wealth</span>
        </div>

        <div className="flex items-center gap-3">
          <TooltipWrapper content="Toggle theme">
            <ModeToggle />
          </TooltipWrapper>

          <TooltipWrapper content="Sign out">
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit" className="gap-2">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </TooltipWrapper>
        </div>
      </div>
    </header>
  );
}
