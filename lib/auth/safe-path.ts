/**
 * Clamp a caller-supplied redirect target to somewhere inside this app.
 *
 * ⚠️ THE OBVIOUS CHECK IS WRONG. `value.startsWith("/") && !value.startsWith("//")`
 * looks airtight and is not: browsers resolve a Location header with the WHATWG
 * URL parser, which treats a backslash as a slash. So `/\evil.com` passes that
 * test and then resolves to `https://evil.com/`. That turns the site into a
 * one-click off-site redirector, and worse — planted in the sign-in form's
 * hidden `redirect_to`, it sends someone to an attacker's page at the exact
 * moment they have just typed a real password on the real domain.
 *
 * So parse with the same parser the browser uses, against a throwaway origin,
 * and keep the result only if it did not escape. That cannot drift from browser
 * behaviour the way a hand-rolled string test does, and it also disposes of
 * absolute URLs, protocol-relative URLs, and embedded control characters.
 *
 * Ported verbatim from sdg-portal (`lib/auth/safe-path.ts`, commit e20e8ae),
 * where it guards the same Supabase auth-callback shape. Keep the two copies
 * identical: if one is corrected, correct the other.
 */

/** Any origin works; it only ever exists to be compared against. */
const SENTINEL_ORIGIN = "https://lpc.invalid";

export function safePath(value: string | null | undefined, fallback = "/"): string {
  if (!value) return fallback;
  try {
    const url = new URL(value, SENTINEL_ORIGIN);
    if (url.origin !== SENTINEL_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
