"use client";

import { GoalsList } from "@/components/goals/goals-list";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Goal } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

interface GoalsClientProps {
  user: User;
  goals: Goal[];
}

export function GoalsClient({ user, goals }: GoalsClientProps) {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Summary</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Goals</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">
            Set and track your savings goals with progress visualization
          </p>
        </div>
      </div>

      {/* Goals List */}
      <div>
        <GoalsList goals={goals} />
      </div>
    </div>
  );
}
