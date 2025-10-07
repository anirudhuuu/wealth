"use client";

import { TooltipProviderWrapper } from "@/components/ui/tooltip-wrapper";
import type React from "react";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProviderWrapper>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        {/* Mobile Navigation */}
        <nav className="border-b bg-background md:hidden">
          <div className="container flex items-center gap-1 overflow-x-auto px-4 py-2">
            {/* Mobile nav items can be added here if needed */}
          </div>
        </nav>

        <div className="flex flex-1">
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-7xl px-4 py-6 md:px-6 md:py-8">
              {children}
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </TooltipProviderWrapper>
  );
}
