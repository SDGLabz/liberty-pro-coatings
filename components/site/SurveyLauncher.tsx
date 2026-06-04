"use client";

import { useSite } from "./SiteProvider";

// Spidercraft "launcher": a frosted faux-form preview with a play-button
// overlay that OPENS the shared multi-step contractor survey. The house rule
// is one conversion path + never an inline multi-step form on the page.
export function SurveyLauncher() {
  const { openSurvey } = useSite();
  return (
    <div
      className="launcher reveal"
      role="button"
      tabIndex={0}
      onClick={openSurvey}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openSurvey();
        }
      }}
      aria-label="Start a request — opens the contractor application"
    >
      <div className="faux" aria-hidden="true">
        <div className="l s" />
        <div className="l box" />
        <div className="l m" />
        <div className="l box" />
        <div className="l s" />
        <div className="l box" />
      </div>
      <div className="scrim">
        <div className="play" aria-hidden="true" />
        <h3>Start your request</h3>
        <p>
          Answer a few quick questions — contractor application, project quote, sample kit, or a
          specialist — and we&apos;ll route you to the right place.
        </p>
      </div>
    </div>
  );
}
