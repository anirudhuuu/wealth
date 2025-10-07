"use client";

import { LayoutDashboard, Settings, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Ledgers",
    url: "/ledgers",
    icon: Wallet,
  },
  {
    title: "Assets",
    url: "/assets",
    icon: TrendingUp,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary md:h-8 md:w-8">
            <Wallet className="h-4 w-4 text-primary-foreground md:h-5 md:w-5" />
          </div>
          <span className="text-base font-semibold md:text-lg">Wealth</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    size="lg"
                    className="h-12 md:h-8 text-base md:text-sm"
                  >
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2 md:px-2 md:py-1"
                    >
                      <item.icon className="h-6 w-6 md:h-4 md:w-4" />
                      <span className="text-base font-medium md:text-sm md:font-normal">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
