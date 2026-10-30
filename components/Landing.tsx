"use client";

import { useMemo, useState } from "react";
import { CACHE_VALLEY_CITIES, type PropertyKind } from "@/lib/cities";
import {
  DEFAULT_ASSUMPTIONS,
  affordabilityEstimate,
  formatMoney,
  paymentEstimate,
  type Assumptions,
} from "@/lib/estimates";
import type { MarketSnapshot, PriceSegment } from "@/lib/market";

type Tool = "cma" | "affordability" | "payment";

type Thanks = {
  tool: Tool;
  city?: string;
  kind?: PropertyKind;
  summary: string;
};

const CMA_DISCLAIMER =
  "This CMA is an estimate of market value and is not an appraisal. For lending purposes, contact a licensed appraiser.";
const LOAN_DISCLAIMER =
  "This is an illustration, not a loan offer or a preapproval. Rates, taxes, insurance, and credit change the payment. Verify it with a licensed lender.";
const OFFICE_PHONE = "435-278-1619";
const PHONE_HREF = "tel:+14352781619";

export function Landing({ market }: { market: MarketSnapshot }) {
  const [tool, setTool] = useState<Tool>("cma");
  const [thanks, setThanks] = useState<Thanks | null>(null);

  function choose(next: Tool) {
    setThanks(null);
    setTool(next);
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <header className="header">
        <img className="logo" src="/brand/logo-on-light.png" alt="RE/MAX Peaks" />
        <a className="call" href={PHONE_HREF}>
          <span>Call</span>
          <span>{OFFICE_PHONE}</span>
        </a>
      </header>

      <section className="hero hero-grid">
        <div>
          <p className="eyebrow">LOGAN MAIN STREET</p>
          <h1>What is your Cache Valley home worth?</h1>
          <p className="support">
            Free CMA from the RE/MAX Peaks office on Main Street. No listing appointment.
          </p>
          <button className="button" type="button" onClick={() => choose("cma")}>
            Get my free CMA
          </button>
          <button className="text-link" type="button" onClick={() => choose("affordability")}>
            I don’t own yet — see what you can afford.
          </button>
        </div>

        <div className="tools" id="tools">
          {thanks ? (
            <ThanksPanel thanks={thanks} market={market} onReset={() => setThanks(null)} />
          ) : (
            <>
              <div className="chooser" role="tablist" aria-label="What do you want">
                <TabButton selected={tool === "cma"} onClick={() => choose("cma")}>
                  My home’s value
                </TabButton>
                <TabButton selected={tool === "affordability"} onClick={() => choose("affordability")}>
                  What I can afford
                </TabButton>
                <TabButton selected={tool === "payment"} onClick={() => choose("payment")}>
                  Monthly payment
                </TabButton>
              </div>
              {tool === "cma" ? <CmaForm onDone={setThanks} /> : null}
              {tool === "affordability" ? <AffordForm onDone={setThanks} /> : null}
              {tool === "payment" ? <PaymentForm onDone={setThanks} /> : null}
            </>
          )}
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

function TabButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button className="pill" type="button" role="tab" aria-selected={selected} onClick={onClick}>
      {children}
    </button>
  );
}

function CmaForm({ onDone }: { onDone: (thanks: Thanks) => void }) {
  const [kind, setKind] = useState<PropertyKind>("singleFamily");
  const [city, setCity] = useState("Logan");
  const [textConsent, setTextConsent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const address = String(data.get("address") ?? "").trim();
    const name = String(data.get("name") ?? "");
    const phone = String(data.get("phone") ?? "");
    const email = String(data.get("email") ?? "");
    const beds = String(data.get("beds") ?? "").trim();
    const baths = String(data.get("baths") ?? "").trim();
    const sqft = String(data.get("sqft") ?? "").trim();
    if (!address) {
      setError("Add the street address.");
      return;
    }
    const label = kind === "singleFamily" ? "Single-family" : "Townhome";
    const extras = [beds && `${beds} bed`, baths && `${baths} bath`, sqft && `${sqft} sqft`]
      .filter(Boolean)
      .join(", ");
    const details = `Free CMA request for ${address}, ${city}. ${label}.${extras ? ` ${extras}.` : ""}`;
    setPending(true);
    setError("");
    const result = await postLead({
      tool: "cma",
      name,
      phone,
      email,
      textConsent,
      details,
      company: String(data.get("company") ?? ""),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone({
      tool: "cma",
      city,
      kind,
      summary: `A Peaks agent will prepare the CMA for ${address}, ${city}, and follow up.`,
    });
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <Field label="Street address" name="address" autoComplete="street-address" required />
      <div className="pair">
        <label>
          City
          <select name="city" value={city} onChange={(event) => setCity(event.target.value)}>
            {CACHE_VALLEY_CITIES.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <div>
          <span className="field-label">Property type</span>
          <div className="chips">
            <TypeChip kind="singleFamily" current={kind} onChange={setKind} label="Single-family" />
            <TypeChip kind="townhome" current={kind} onChange={setKind} label="Townhome" />
          </div>
        </div>
      </div>
      <div className="triple">
        <Field label="Beds (optional)" name="beds" inputMode="decimal" />
        <Field label="Baths (optional)" name="baths" inputMode="decimal" />
        <Field label="Approx. sqft (optional)" name="sqft" inputMode="numeric" />
      </div>
      <div className="triple">
        <Field label="Name" name="name" autoComplete="name" required />
        <Field label="Mobile" name="phone" type="tel" autoComplete="tel" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
      </div>
      <Consent checked={textConsent} onChange={setTextConsent} label="Text me about this CMA. Optional." />
      <Honeypot />
      <button className="button" type="submit" disabled={pending} style={{ marginTop: 0 }}>
        {pending ? "Sending…" : "Send my free CMA"}
      </button>
      {error ? <p className="error">{error}</p> : null}
      <p className="fine">{CMA_DISCLAIMER}</p>
    </form>
  );
}

function AffordForm({ onDone }: { onDone: (thanks: Thanks) => void }) {
  const [income, setIncome] = useState("");
  const [debts, setDebts] = useState("");
  const [down, setDown] = useState("");
  const [assumptions, setAssumptions] = useState<Assumptions>({ ...DEFAULT_ASSUMPTIONS });
  const [textConsent, setTextConsent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const estimate = useMemo(
    () => affordabilityEstimate(numberValue(income), numberValue(debts), numberValue(down), assumptions),
    [income, debts, down, assumptions],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!estimate || estimate.maxPrice <= 0) {
      setError("Add monthly income. If the range stays at $0, the debts are above this illustration.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const details = [
      "Affordability illustration.",
      `Monthly income ${formatMoney(numberValue(income))}.`,
      `Monthly debts ${formatMoney(numberValue(debts))}.`,
      `Down payment ${formatMoney(numberValue(down))}.`,
      `Range ${formatMoney(estimate.comfortablePrice)} to ${formatMoney(estimate.maxPrice)}.`,
      `Limited by ${estimate.limitingRule}.`,
      assumptionSentence(assumptions),
    ].join(" ");
    setPending(true);
    setError("");
    const result = await postLead({
      tool: "affordability",
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      textConsent,
      details,
      company: String(data.get("company") ?? ""),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone({
      tool: "affordability",
      summary: `A Peaks agent will follow up on the ${formatMoney(estimate.comfortablePrice)} to ${formatMoney(estimate.maxPrice)} range.`,
    });
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <Field label="Monthly income, before taxes" name="income" inputMode="decimal" value={income} onChange={setIncome} required />
      <div className="pair">
        <Field label="Monthly debts" name="debts" inputMode="decimal" value={debts} onChange={setDebts} />
        <Field label="Down payment" name="down" inputMode="decimal" value={down} onChange={setDown} />
      </div>
      <AssumptionsEditor assumptions={assumptions} onChange={setAssumptions} />
      {estimate ? (
        <div className="result">
          <p className="fine">A comfortable to maximum purchase price</p>
          <strong>
            {formatMoney(estimate.comfortablePrice)} – {formatMoney(estimate.maxPrice)}
          </strong>
          <p>
            Housing payment about {formatMoney(estimate.comfortableHousingPayment)} to{" "}
            {formatMoney(estimate.maxHousingPayment)} a month. The top of the range uses{" "}
            {estimate.limitingRule}.
          </p>
          <p className="fine">{LOAN_DISCLAIMER}</p>
        </div>
      ) : null}
      <div className="triple">
        <Field label="Name" name="name" autoComplete="name" required />
        <Field label="Mobile" name="phone" type="tel" autoComplete="tel" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
      </div>
      <Consent checked={textConsent} onChange={setTextConsent} label="Text me this range. Optional." />
      <Honeypot />
      <button className="button" type="submit" disabled={pending} style={{ marginTop: 0 }}>
        {pending ? "Sending…" : "Send this to a Peaks agent"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}

function PaymentForm({ onDone }: { onDone: (thanks: Thanks) => void }) {
  const [price, setPrice] = useState("");
  const [down, setDown] = useState("");
  const [assumptions, setAssumptions] = useState<Assumptions>({ ...DEFAULT_ASSUMPTIONS });
  const [textConsent, setTextConsent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const estimate = useMemo(
    () => paymentEstimate(numberValue(price), numberValue(down), assumptions),
    [price, down, assumptions],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!estimate) {
      setError("Add a purchase price.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const details = [
      "Monthly payment illustration.",
      `Price ${formatMoney(numberValue(price))}.`,
      `Down payment ${formatMoney(numberValue(down))}.`,
      `Principal and interest ${formatMoney(estimate.principalAndInterest)}.`,
      `Taxes ${formatMoney(estimate.taxes)}, insurance ${formatMoney(estimate.insurance)}, HOA ${formatMoney(estimate.hoa)}.`,
      `Total about ${formatMoney(estimate.total)} a month.`,
      assumptionSentence(assumptions),
    ].join(" ");
    setPending(true);
    setError("");
    const result = await postLead({
      tool: "payment",
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      textConsent,
      details,
      company: String(data.get("company") ?? ""),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone({
      tool: "payment",
      summary: `A Peaks agent will follow up. The illustration was about ${formatMoney(estimate.total)} a month.`,
    });
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <div className="pair">
        <Field label="Purchase price" name="price" inputMode="decimal" value={price} onChange={setPrice} required />
        <Field label="Down payment" name="down" inputMode="decimal" value={down} onChange={setDown} />
      </div>
      <AssumptionsEditor assumptions={assumptions} onChange={setAssumptions} />
      {estimate ? (
        <div className="result">
          <p className="fine">Estimated monthly payment</p>
          <strong>{formatMoney(estimate.total)}</strong>
          <p>
            Principal and interest {formatMoney(estimate.principalAndInterest)}. Taxes{" "}
            {formatMoney(estimate.taxes)}. Insurance {formatMoney(estimate.insurance)}. HOA{" "}
            {formatMoney(estimate.hoa)}.
          </p>
          <p className="fine">{LOAN_DISCLAIMER}</p>
        </div>
      ) : null}
      <div className="triple">
        <Field label="Name" name="name" autoComplete="name" required />
        <Field label="Mobile" name="phone" type="tel" autoComplete="tel" required />
        <Field label="Email" name="email" type="email" autoComplete="email" required />
      </div>
      <Consent checked={textConsent} onChange={setTextConsent} label="Text me this estimate. Optional." />
      <Honeypot />
      <button className="button" type="submit" disabled={pending} style={{ marginTop: 0 }}>
        {pending ? "Sending…" : "Send this to a Peaks agent"}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}

function AssumptionsEditor({
  assumptions,
  onChange,
}: {
  assumptions: Assumptions;
  onChange: (next: Assumptions) => void;
}) {
  function set(key: keyof Assumptions, value: string) {
    onChange({ ...assumptions, [key]: numberValue(value) });
  }
  return (
    <details>
      <summary>Assumptions you can change</summary>
      <div className="assumption-grid">
        <Field label="Interest rate %" value={String(assumptions.annualRatePercent)} onChange={(value) => set("annualRatePercent", value)} />
        <Field label="Term, years" value={String(assumptions.termYears)} onChange={(value) => set("termYears", value)} />
        <Field label="Property tax, % of price per year" value={String(assumptions.annualTaxPercent)} onChange={(value) => set("annualTaxPercent", value)} />
        <Field label="Home insurance, $ per year" value={String(assumptions.annualInsurance)} onChange={(value) => set("annualInsurance", value)} />
        <Field label="HOA, $ per month" value={String(assumptions.monthlyHoa)} onChange={(value) => set("monthlyHoa", value)} />
      </div>
      <p className="fine" style={{ marginTop: 8 }}>
        These are starting assumptions, not a quote. {LOAN_DISCLAIMER}
      </p>
    </details>
  );
}

function ThanksPanel({
  thanks,
  market,
  onReset,
}: {
  thanks: Thanks;
  market: MarketSnapshot;
  onReset: () => void;
}) {
  const segment = thanks.city && thanks.kind ? segmentFor(market, thanks.city, thanks.kind) : null;
  const label = thanks.kind === "townhome" ? "townhomes" : "single-family homes";
  return (
    <div className="card thanks">
      <p className="eyebrow">YOU’RE SET</p>
      <h2>We’ll take it from here.</h2>
      <p>{thanks.summary}</p>
      {thanks.tool === "cma" ? <p className="fine">{CMA_DISCLAIMER}</p> : <p className="fine">{LOAN_DISCLAIMER}</p>}
      {segment && thanks.city ? (
        <div className="result" style={{ marginTop: 16 }}>
          <p className="fine">
            {label[0].toUpperCase()}
            {label.slice(1)} for sale in {thanks.city}
          </p>
          <strong>{formatMoney(segment.medianListPrice)}</strong>
          <p>
            Median asking price. {segment.count} listed. Average ask {formatMoney(segment.averageListPrice)}.
            This is the market around that address, not your home’s value.
          </p>
        </div>
      ) : thanks.tool === "cma" ? (
        <p className="fine" style={{ marginTop: 12 }}>
          Cache Valley asking prices will show here once the daily MLS update is connected.
        </p>
      ) : null}
      <p style={{ marginTop: 16 }}>
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
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Denver",
        timeZoneName: "short",
      }).format(new Date(market.updatedAt))
    : null;
  const ready = market.status === "live" && (market.singleFamily || market.townhome);
  return (
    <section className="market" aria-labelledby="market-title">
      <p className="eyebrow">ON THE MARKET NOW</p>
      <h2 id="market-title">Cache Valley asking prices</h2>
      <p>
        Single-family homes and townhomes listed for sale. Not sold prices, and not a value for your
        home.
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
      {updated ? <p className="fine" style={{ marginTop: 12 }}>Updated {updated}.</p> : null}
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
        <img className="navy-logo" src="/brand/logo-on-navy.png" alt="" />
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

function TypeChip({
  kind,
  current,
  onChange,
  label,
}: {
  kind: PropertyKind;
  current: PropertyKind;
  onChange: (kind: PropertyKind) => void;
  label: string;
}) {
  return (
    <button className="chip" type="button" aria-pressed={current === kind} onClick={() => onChange(kind)}>
      {label}
    </button>
  );
}

function Consent({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="consent">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
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

function segmentFor(market: MarketSnapshot, city: string, kind: PropertyKind): PriceSegment | null {
  return market.cities[city]?.[kind] ?? (kind === "singleFamily" ? market.singleFamily : market.townhome);
}

function numberValue(value: string): number {
  const parsed = Number(String(value).replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function assumptionSentence(assumptions: Assumptions): string {
  return `Assumptions: ${assumptions.annualRatePercent}% rate, ${assumptions.termYears}-year term, ${assumptions.annualTaxPercent}% annual tax, $${assumptions.annualInsurance} annual insurance, $${assumptions.monthlyHoa} monthly HOA.`;
}

async function postLead(body: Record<string, unknown>): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch("/api/leads", {
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
