"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_ASSUMPTIONS,
  formatMoney,
  paymentEstimate,
  type Assumptions,
} from "@/lib/estimates";
import { BASE_PATH } from "@/lib/base-path";
import type { MarketSnapshot, PriceSegment } from "@/lib/market";
import { HomeSearch } from "@/components/HomeSearch";

type Path = "cma" | "afford";

type Thanks = {
  address: string;
};

const CMA_DISCLAIMER =
  "This CMA is an estimate of market value and is not an appraisal. For lending purposes, contact a licensed appraiser.";
const LOAN_DISCLAIMER =
  "This is an illustration, not a loan offer or a preapproval. Rates, taxes, insurance, and credit change the payment. Verify it with a licensed lender.";
const OFFICE_PHONE = "435-278-1619";
const PHONE_HREF = "tel:+14352781619";

export function Landing({ market, headline }: { market: MarketSnapshot; headline: string }) {
  const [path, setPath] = useState<Path | null>(null);
  const [thanks, setThanks] = useState<Thanks | null>(null);

  function choose(next: Path) {
    setThanks(null);
    setPath(next);
    requestAnimationFrame(() => {
      document.getElementById("next")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <header className="header">
        <img className="logo" src={`${BASE_PATH}/brand/logo-on-light.png`} alt="RE/MAX Peaks" />
        <a className="call" href={PHONE_HREF}>
          <span>Call</span>
          <span>{OFFICE_PHONE}</span>
        </a>
      </header>

      <section className="hero">
        <div className="stage">
          <p className="eyebrow">RE/MAX Peaks Logan Office</p>
          <h1>{headline}</h1>

          <div className="choices" role="group" aria-label="Choose a starting point">
            <button
              className="choice choice-worth"
              type="button"
              aria-pressed={path === "cma"}
              onClick={() => choose("cma")}
            >
              <span className="kicker">Homeowner</span>
              <strong>What’s my home worth?</strong>
              <span>Free CMA from this office.</span>
            </button>
            <button
              className="choice choice-buy"
              type="button"
              aria-pressed={path === "afford"}
              onClick={() => choose("afford")}
            >
              <span className="kicker">Buyer</span>
              <strong>I’m looking to buy</strong>
              <span>See what you can afford.</span>
            </button>
          </div>

          {path === "cma" ? (
            thanks ? (
              <ThanksPanel address={thanks.address} onReset={() => setThanks(null)} />
            ) : (
              <CmaForm onDone={setThanks} />
            )
          ) : null}
          {path === "afford" ? <AffordTool /> : null}
        </div>
      </section>

      <MarketStrip market={market} />
      <Trust />
      <footer className="disclosures">
        <p className="fine">{LOAN_DISCLAIMER}</p>
        <p className="fine">
          Market figures are asking prices of active listings in Cache County, via UtahRealEstate.
          Each snapshot shows the time it was updated. They are not sold prices and not a value for
          a specific home.
        </p>
        <p className="fine">RE/MAX Peaks. Each office independently owned and operated.</p>
      </footer>
    </>
  );
}

function CmaForm({ onDone }: { onDone: (thanks: Thanks) => void }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const address = String(data.get("address") ?? "").trim();
    const name = String(data.get("name") ?? "");
    const phone = String(data.get("phone") ?? "");
    const email = String(data.get("email") ?? "");
    if (!address) {
      setError("Add the property address.");
      return;
    }
    setPending(true);
    setError("");
    const result = await postLead({
      tool: "cma",
      name,
      phone,
      email,
      textConsent: false,
      details: `Free CMA request for ${address}.`,
      company: String(data.get("company") ?? ""),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone({ address });
  }

  return (
    <form className="card stack" id="next" onSubmit={onSubmit}>
      <div>
        <h2>What’s my home worth?</h2>
        <p className="panel-copy">Name, address, phone, and email. That’s all we need.</p>
      </div>
      <Field label="Name" name="name" autoComplete="name" required />
      <Field label="Address" name="address" autoComplete="street-address" required />
      <Field label="Phone" name="phone" type="tel" autoComplete="tel" required />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Honeypot />
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Get my free CMA"}
      </button>
      {error ? <p className="error">{error}</p> : null}
      <p className="fine">{CMA_DISCLAIMER}</p>
    </form>
  );
}

function AffordTool() {
  const [price, setPrice] = useState("");
  const [down, setDown] = useState("");
  const [rate, setRate] = useState(String(DEFAULT_ASSUMPTIONS.annualRatePercent));

  const assumptions = useMemo<Assumptions>(
    () => ({ ...DEFAULT_ASSUMPTIONS, annualRatePercent: numberValue(rate) }),
    [rate],
  );
  const estimate = useMemo(
    () => paymentEstimate(numberValue(price), numberValue(down), assumptions),
    [price, down, assumptions],
  );

  return (
    <div className="card stack" id="next">
      <div>
        <h2>What can I afford?</h2>
        <p className="panel-copy">Enter a price. The monthly payment updates here.</p>
      </div>
      <Field
        label="Home price"
        name="price"
        inputMode="decimal"
        value={price}
        onChange={setPrice}
      />
      <Field
        label="Down payment"
        name="down"
        inputMode="decimal"
        value={down}
        onChange={setDown}
      />
      <div className="result" aria-live="polite">
        <p className="fine">Monthly payment</p>
        <strong>{estimate ? formatMoney(estimate.total) : "—"}</strong>
        {estimate ? (
          <p>
            {formatMoney(estimate.principalAndInterest)} principal and interest
            {" · "}
            {formatMoney(estimate.taxes)} taxes
            {" · "}
            {formatMoney(estimate.insurance)} insurance
          </p>
        ) : (
          <p>Add a home price to see the payment.</p>
        )}
      </div>
      <Field
        label="Interest rate %"
        name="rate"
        inputMode="decimal"
        value={rate}
        onChange={setRate}
      />
      <p className="fine">
        {DEFAULT_ASSUMPTIONS.termYears}-year term, {DEFAULT_ASSUMPTIONS.annualTaxPercent}% yearly
        property tax, and {formatMoney(DEFAULT_ASSUMPTIONS.annualInsurance)} a year for insurance.{" "}
        {LOAN_DISCLAIMER}
      </p>
    </div>
  );
}

function ThanksPanel({ address, onReset }: { address: string; onReset: () => void }) {
  return (
    <div className="card thanks" id="next">
      <p className="eyebrow">YOU’RE SET</p>
      <h2>We’ll take it from here.</h2>
      <p>A Peaks agent will prepare the CMA for {address} and follow up.</p>
      <p className="fine">{CMA_DISCLAIMER}</p>
      <p>
        <a href={PHONE_HREF}>Call or text {OFFICE_PHONE}</a>
      </p>
      <button className="text-link" type="button" onClick={onReset}>
        Start another request
      </button>
    </div>
  );
}

function MarketStrip({ market }: { market: MarketSnapshot }) {
  const updated = market.updatedAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/Denver",
        timeZoneName: "short",
      }).format(new Date(market.updatedAt))
    : null;
  const ready = market.status === "live" && (market.singleFamily || market.townhome);
  return (
    <section className="market" aria-labelledby="market-title">
      <p className="eyebrow">ON THE MARKET NOW</p>
      <h2 id="market-title">Cache Valley current inventory</h2>
      <p>
        Active single-family homes and townhomes in Cache County. These are asking prices, not sold
        prices, and not a value for your home. Refreshed every morning at 6:00 AM Mountain time.
      </p>
      {ready ? (
        <div className="stats">
          <StatCard title="Single-family" segment={market.singleFamily} />
          <StatCard title="Townhomes" segment={market.townhome} />
        </div>
      ) : (
        <div className="waiting">
          Cache Valley asking prices will appear here after the daily MLS update. The page stays up
          either way.
        </div>
      )}
      {updated ? (
        <p className="fine" style={{ marginTop: 12 }}>
          Updated {updated}.
        </p>
      ) : null}
      <HomeSearch />
    </section>
  );
}

function StatCard({ title, segment }: { title: string; segment: PriceSegment | null }) {
  if (!segment) {
    return (
      <article className="stat">
        <p>{title}</p>
        <strong>None listed</strong>
        <span>No active asking prices in this group.</span>
      </article>
    );
  }
  return (
    <article className="stat">
      <p>{title}</p>
      <strong>{segment.count.toLocaleString("en-US")} for sale</strong>
      <span>Median ask {formatMoney(segment.medianListPrice)}</span>
      <span className="avg">Average ask {formatMoney(segment.averageListPrice)}</span>
    </article>
  );
}

function Trust() {
  return (
    <section className="trust">
      <div className="trust-row">
        <img className="navy-logo" src={`${BASE_PATH}/brand/logo-on-navy.png`} alt="" />
        <div>
          <h2>Local agents, not a call center.</h2>
          <p>255 S Main St. #120, Logan, UT 84321</p>
        </div>
        <div className="trust-actions">
          <a href={PHONE_HREF}>Call or text {OFFICE_PHONE}</a>
          <a href="mailto:office@remaxpeaks.com">office@remaxpeaks.com</a>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  required,
}: {
  label: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "decimal" | "numeric" | "tel" | "email";
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
    </label>
  );
}

function Honeypot() {
  return (
    <div className="honeypot" aria-hidden="true">
      <label>
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function numberValue(value: string): number {
  const parsed = Number(String(value).replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function postLead(body: Record<string, unknown>): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch(`${BASE_PATH}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      return {
        ok: false,
        error: payload.error ?? `Call or text ${OFFICE_PHONE} and a Peaks agent will start this.`,
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: `Call or text ${OFFICE_PHONE} and a Peaks agent will start this.` };
  }
}
