"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { signOut } from "@/lib/actions/auth-actions";
import { LogOut } from "lucide-react";
import { useTransition } from "react";

export function Navbar() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 w-full">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <span className="font-display text-xl font-bold tracking-tight text-primary">
            Wealth
          </span>
        </div>

        <div className="flex items-center gap-3">
          <TooltipWrapper content="Toggle theme">
            <ModeToggle />
          </TooltipWrapper>

          <TooltipWrapper content="Sign out">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={isPending}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              {isPending && <span className="text-xs">...</span>}
            </Button>
          </TooltipWrapper>
        </div>
      </div>
    </header>
  );
}
