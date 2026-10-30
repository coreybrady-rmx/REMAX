"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "@/lib/analytics";

type Props = {
  agentSlug: string;
  agentName: string;
  ghlAssignee: string;
  intent: "contact" | "home-value";
  className?: string;
};

export function LeadForm({
  agentSlug,
  agentName,
  ghlAssignee,
  intent,
  className,
}: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const first = agentName.split(" ")[0];

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          intent,
          agentSlug,
          agentName,
          ghlAssignee,
          source: `agent-microsite:${agentSlug}:${intent}`,
          pageUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      trackEvent(
        intent === "home-value" ? "home_value_submit" : "contact_submit",
        {
          agent_slug: agentSlug,
          agent_name: agentName,
        },
      );

      setStatus("ok");
      setMessage(
        intent === "home-value"
          ? `Thanks! ${first} will get back to you with a CMA.`
          : `Thanks! ${first} will be in touch soon.`,
      );
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please call or text instead.");
    }
  }

  if (intent === "home-value") {
    return (
      <form className={className ?? "lead-form"} onSubmit={onSubmit}>
        <input
          type="text"
          name="propertyAddress"
          placeholder="Address*"
          required
          autoComplete="street-address"
        />
        <input
          type="text"
          name="full_name"
          placeholder="Name*"
          required
          autoComplete="name"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone*"
          required
          autoComplete="tel"
        />
        <input
          type="email"
          name="email"
          placeholder="Email*"
          required
          autoComplete="email"
        />
        <button
          type="submit"
          className="btn btn-red"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending…" : "Get My Home Value"}
        </button>
        {message ? (
          <p
            className={`form-status ${status === "error" ? "is-error" : "is-ok"}`}
            role="status"
          >
            {message}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <form className={className ?? "lead-form"} onSubmit={onSubmit}>
      <input type="text" name="full_name" placeholder="Name*" required />
      <input type="email" name="email" placeholder="Email*" required />
      <input type="tel" name="phone" placeholder="Phone*" required />
      <textarea name="message" placeholder="How can I help?" rows={4} />
      <button
        type="submit"
        className="btn btn-red"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending…" : `Message ${first}`}
      </button>
      {message ? (
        <p
          className={`form-status ${status === "error" ? "is-error" : "is-ok"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
