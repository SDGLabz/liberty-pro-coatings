import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isPreLaunchOrigin } from "@/lib/indexing";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Keep the pre-launch origins out of the index. robots.txt asks a crawler not
  // to fetch a URL; it does not stop one it already knows about from being
  // listed, so X-Robots-Tag is the half that actually removes it. Both are set.
  // Gated on the request host, so the real domain is untouched and there is
  // nothing to undo at cutover. See lib/indexing.ts.
  if (isPreLaunchOrigin(request.headers.get("host"))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  // Run on all routes except static assets and image files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
