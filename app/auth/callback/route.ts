import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safePath } from "@/lib/auth/safe-path";

// Auth redirect target for magic links / email confirmations. Exchanges the
// one-time code for a session cookie, then sends the user on their way.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` arrives from the URL, so it is attacker-controlled, and it is pasted
  // straight into a Location header below. It has to be parsed and clamped, not
  // string-tested: `?next=/\evil.com` survives a startsWith("/") check and still
  // resolves to https://evil.com/. See lib/auth/safe-path.ts for why.
  const next = safePath(searchParams.get("next"), "/account");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not sign you in. Please try again.`);
}
