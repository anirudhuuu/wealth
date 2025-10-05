"use client";

import type React from "react";

import { AppLayout } from "./app-layout";

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
