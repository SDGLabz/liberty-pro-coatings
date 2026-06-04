"use client";

import type { ReactNode } from "react";
import { useSite } from "./SiteProvider";

// A button that opens the shared contractor-application survey. Lets
// server-rendered page content (e.g. the home CTA) trigger the one
// conversion path without making the whole page a client component.
export function SurveyButton({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const { openSurvey } = useSite();
  return (
    <button type="button" className={className} onClick={openSurvey}>
      {children}
    </button>
  );
}
