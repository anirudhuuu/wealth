"use client";

import { LayoutDashboard, Settings, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Summary",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Budget Books",
    url: "/ledgers",
    icon: Wallet,
  },
  {
    title: "Savings",
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
          <Avatar className="h-6 w-6 md:h-8 md:w-8">
            <AvatarImage src="/api/placeholder/32/32" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
              <Wallet className="h-3 w-3 md:h-4 md:w-4" />
            </AvatarFallback>
          </Avatar>
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
