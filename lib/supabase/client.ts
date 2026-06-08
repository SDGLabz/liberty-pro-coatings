import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client (publishable/anon key). Safe to use in the
// browser because Row-Level Security governs what it can read or write.
// Use in Client Components — e.g. the login form and the header's auth state.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
