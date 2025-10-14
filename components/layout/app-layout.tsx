"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProviderWrapper } from "@/components/ui/tooltip-wrapper";
import type React from "react";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <TooltipProviderWrapper>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <Navbar />
            <main className="flex-1 overflow-y-auto w-full">
              <div className="w-full px-4 py-6 md:px-6 md:py-8">{children}</div>
            </main>
            <Footer />
          </div>
        </div>
      </TooltipProviderWrapper>
    </SidebarProvider>
  );
}
