import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const origin = requestUrl.origin;

  console.log("Auth callback received:", {
    code: code ? "present" : "missing",
    error,
    origin,
  });

  if (error) {
    console.error("Auth error:", error);
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(error)}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      console.log("Attempting code exchange...");
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        return NextResponse.redirect(
          `${origin}/sign-in?error=${encodeURIComponent(exchangeError.message)}`
        );
      }

      console.log("Code exchange successful!");
    } catch (error) {
      console.error("Unexpected error:", error);
      return NextResponse.redirect(
        `${origin}/sign-in?error=${encodeURIComponent("Authentication failed")}`
      );
    }
  } else {
    console.log("No code provided, redirecting to sign-in");
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(
        "No authentication code received"
      )}`
    );
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(`${origin}/dashboard`);
}
