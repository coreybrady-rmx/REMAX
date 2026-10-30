"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { smsHref, telHref } from "@/lib/phone";

type Props = {
  agentSlug: string;
  firstName: string;
  phone: string;
  homeValueHref: string;
};

export function StickyMobileBar({
  agentSlug,
  firstName,
  phone,
  homeValueHref,
}: Props) {
  return (
    <div className="sticky-mobile-bar" role="navigation" aria-label="Quick contact">
      <a
        href={telHref(phone)}
        onClick={() =>
          trackEvent("cta_call_click", { agent_slug: agentSlug, placement: "sticky" })
        }
      >
        Call
      </a>
      <a
        href={smsHref(phone, `Hi ${firstName}, I found you on RE/MAX Peaks.`)}
        onClick={() =>
          trackEvent("cta_text_click", { agent_slug: agentSlug, placement: "sticky" })
        }
      >
        Text
      </a>
      <Link
        href={homeValueHref}
        className="is-primary"
        onClick={() =>
          trackEvent("cta_home_value_click", {
            agent_slug: agentSlug,
            placement: "sticky",
          })
        }
      >
        Home Value
      </Link>
    </div>
  );
}
