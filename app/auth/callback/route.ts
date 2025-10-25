import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const origin = requestUrl.origin;

  if (error) {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(error)}`
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        return NextResponse.redirect(
          `${origin}/sign-in?error=${encodeURIComponent(exchangeError.message)}`
        );
      }
    } catch (error) {
      return NextResponse.redirect(
        `${origin}/sign-in?error=${encodeURIComponent("Authentication failed")}`
      );
    }
  } else {
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(
        "No authentication code received"
      )}`
    );
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(`${origin}/dashboard`);
}
