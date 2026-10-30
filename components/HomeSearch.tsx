"use client";

import { useState } from "react";
import { classifySubtype } from "@/lib/market";
import { formatMoney } from "@/lib/estimates";
import type { HomeHit } from "@/lib/search";

type SearchPayload = {
  ok: true;
  total: number | null;
  homes: HomeHit[];
};

export function HomeSearch() {
  const [query, setQuery] = useState("");
  const [homes, setHomes] = useState<HomeHit[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = query.trim();
    if (next.length < 2) {
      setError("Enter a city or part of an address.");
      setHomes(null);
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(next)}`);
      const payload = (await response.json()) as SearchPayload | { ok: false; error?: string };
      if (!response.ok || !payload.ok) {
        setHomes(null);
        setError("error" in payload && payload.error ? payload.error : "The listing search didn't respond.");
        return;
      }
      setHomes(payload.homes);
      setTotal(payload.total);
    } catch {
      setHomes(null);
      setError("The listing search didn't respond. Try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="home-search">
      <form onSubmit={onSubmit}>
        <label htmlFor="home-search">Search homes in the valley</label>
        <div className="search-row">
          <input
            id="home-search"
            name="q"
            value={query}
            placeholder="City or address"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="search-button" type="submit" disabled={pending}>
            {pending ? "Searching…" : "Search"}
          </button>
        </div>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {homes ? (
        <div className="hits">
          <p className="fine">
            {homes.length === 0
              ? "No active homes matched that search."
              : total && total > homes.length
                ? `Showing ${homes.length} of ${total.toLocaleString("en-US")} active homes.`
                : `${homes.length} active ${homes.length === 1 ? "home" : "homes"}.`}
          </p>
          {homes.map((home) => (
            <a key={home.id} className="hit" href={home.url} target="_blank" rel="noreferrer">
              <span className="hit-address">{home.address}</span>
              <strong>{formatMoney(home.price)}</strong>
              <span>
                {home.city}
                {homeDetail(home) ? ` · ${homeDetail(home)}` : ""}
                {` · ${subtypeLabel(home.subtype)}`}
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function homeDetail(home: HomeHit): string {
  const parts = [];
  if (home.beds !== null) parts.push(`${home.beds} bd`);
  if (home.baths !== null) parts.push(`${home.baths} ba`);
  return parts.join(" · ");
}

function subtypeLabel(value: string): string {
  const kind = classifySubtype(value);
  if (kind === "singleFamily") return "Single-family";
  if (kind === "townhome") return "Townhome";
  return value || "Home";
}
