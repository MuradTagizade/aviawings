import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/** OAuth / magic-link callback: exchanges the code, then sends the user home. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/tr/account";

  if (code) {
    const supabase = await getSupabaseServer();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }
  // Only allow relative redirects
  const safeNext = next.startsWith("/") ? next : "/";
  return NextResponse.redirect(new URL(safeNext, url.origin));
}
