"use client";

import { useState, type FormEvent } from "react";
import { GIBBONS_PARK_LOT_URL } from "@/lib/assumptions";

export function InvestorInquiry({ configured }: { configured: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setStatus("error");
        setError(payload.error || "The inquiry was not accepted.");
        return;
      }
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setError("The inquiry could not be sent.");
    }
  }

  return (
    <section id="inquiry" className="scroll-mt-24 bg-ivory px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-2">
        <div>
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em]">
            <span className="h-px w-8 bg-gold" aria-hidden="true" />
            Inquiry
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            Explore the Heritage Investment
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-charcoal/75">
            Request the illustration details, or open the public homesite page
            for Gibbons Park Estates. This form does not create an investment,
            a reservation, or an offer.
          </p>
          <a
            href={GIBBONS_PARK_LOT_URL}
            className="mt-8 inline-flex min-h-12 items-center border border-charcoal px-5 text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore Gibbons Park Lots
          </a>
        </div>
        <form className="bg-white px-5 py-6 md:px-8" onSubmit={onSubmit} noValidate>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm" htmlFor="inquiry-name">
              Name
              <input
                id="inquiry-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="min-h-12 border border-charcoal/20 bg-ivory px-3"
              />
            </label>
            <label className="grid gap-2 text-sm" htmlFor="inquiry-email">
              Email
              <input
                id="inquiry-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="min-h-12 border border-charcoal/20 bg-ivory px-3"
              />
            </label>
            <label className="grid gap-2 text-sm" htmlFor="inquiry-phone">
              Phone <span className="text-charcoal/55">(optional)</span>
              <input
                id="inquiry-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="min-h-12 border border-charcoal/20 bg-ivory px-3"
              />
            </label>
            <label className="grid gap-2 text-sm" htmlFor="inquiry-message">
              Message
              <textarea
                id="inquiry-message"
                name="message"
                required
                rows={5}
                className="border border-charcoal/20 bg-ivory px-3 py-3"
              />
            </label>
            <label className="flex items-start gap-3 text-sm leading-relaxed" htmlFor="inquiry-consent">
              <input
                id="inquiry-consent"
                name="consent"
                type="checkbox"
                className="mt-1 h-4 w-4"
                required={configured}
              />
              <span>
                I understand this page is a preliminary illustration and not an
                offer to sell securities. I am requesting information only.
              </span>
            </label>
          </div>
          {!configured ? (
            <p id="inquiry-status" role="status" className="mt-5 text-sm leading-relaxed">
              Submission is not configured.
            </p>
          ) : null}
          {status === "sent" ? (
            <p role="status" className="mt-5 text-sm">
              The inquiry was accepted by the configured endpoint.
            </p>
          ) : null}
          {status === "error" ? (
            <p role="alert" className="mt-5 text-sm">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-6 inline-flex min-h-12 items-center bg-charcoal px-5 text-sm font-medium text-ivory disabled:cursor-not-allowed disabled:bg-charcoal/35"
            disabled={!configured || status === "sending"}
            aria-describedby={configured ? undefined : "inquiry-status"}
          >
            {status === "sending" ? "Sending" : "Request Investment Details"}
          </button>
        </form>
      </div>
    </section>
  );
}
