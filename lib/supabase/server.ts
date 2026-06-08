import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Server-side Supabase client bound to the request's auth cookies, so it acts
// AS the signed-in user (Row-Level Security applies). Use in Server
// Components, Route Handlers, and Server Actions.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component (cookies are read-only there);
            // the middleware refreshes the session cookie instead.
          }
        },
      },
    },
  );
}

// Privileged server-ONLY client (secret key) that BYPASSES Row-Level
// Security. Use strictly in trusted server code for admin work — the
// approval queue and the server-side checkout gate. Never import this into
// a Client Component or expose the key to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
