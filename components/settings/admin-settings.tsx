"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminSettings() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Find user by email
      const { data: profiles, error: searchError } = await supabase
        .from("profiles")
        .select("id, email, is_admin")
        .eq("email", email)
        .single();

      if (searchError || !profiles) {
        throw new Error("User not found");
      }

      if (profiles.is_admin) {
        setMessage({ type: "error", text: "User is already an admin" });
        setIsLoading(false);
        return;
      }

      // Grant admin access
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", profiles.id);

      if (updateError) throw updateError;

      setMessage({ type: "success", text: `Admin access granted to ${email}` });
      setEmail("");
      router.refresh();
    } catch (error) {
      console.error("Error granting admin access:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to grant admin access",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          <CardTitle>Admin Management</CardTitle>
        </div>
        <CardDescription>Grant admin access to other users</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGrantAdmin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminEmail">User Email</Label>
            <Input
              id="adminEmail"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the email of a registered user to grant them admin access
            </p>
          </div>

          {message && (
            <div
              className={`rounded-md p-3 text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                  : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Granting Access..." : "Grant Admin Access"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
