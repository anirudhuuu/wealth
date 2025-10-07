import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { handleApiError } from "../../../../lib/api-error-handler";

// POST /api/auth/signout - Sign out user
export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
