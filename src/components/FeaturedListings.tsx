"use client";

import { useEffect, useState } from "react";

type Listing = {
  mlsNumber: string;
  price: number | null;
  address: string;
  city: string;
  state: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  photo?: string;
  category?: string;
};

function money(n: number | null) {
  if (n == null) return "Call for price";
  return `$${n.toLocaleString("en-US")}`;
}

export function FeaturedListings({ city = "Logan" }: { city?: string }) {
  const [items, setItems] = useState<Listing[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/search-listings?city=${encodeURIComponent(city)}&category=residential&limit=6`,
        );
        if (!res.ok) throw new Error("Failed to load listings");
        const data = await res.json();
        if (!cancelled) {
          setItems((data.items || []).slice(0, 6));
        }
      } catch {
        if (!cancelled) setError("Listings temporarily unavailable.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [city]);

  return (
    <section className="section featured-listings">
      <div className="section-head">
        <p className="eyebrow">Live market</p>
        <h2>Homes in {city}</h2>
        <p>Browse active MLS listings, then reach out when you want a showing.</p>
      </div>
      {error ? <p className="muted">{error}</p> : null}
      <div className="listing-grid">
        {items.map((item) => (
          <a
            key={item.mlsNumber}
            className="listing-card"
            href={`https://www.remaxpeaks.com/listings/${item.mlsNumber}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="listing-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  item.photo ||
                  "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/68e69ec8a4783153c5e09dd4.webp"
                }
                alt={`${item.address}, ${item.city}`}
                loading="lazy"
              />
            </div>
            <div className="listing-body">
              <p className="listing-price">{money(item.price)}</p>
              <p className="listing-address">
                {item.address}, {item.city}
              </p>
              <p className="listing-meta">
                {[
                  item.beds != null ? `${item.beds} bd` : null,
                  item.baths != null ? `${item.baths} ba` : null,
                  item.sqft != null ? `${item.sqft.toLocaleString()} sqft` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </a>
        ))}
      </div>
      <div className="section-cta">
        <a className="btn btn-red" href="https://www.remaxpeaks.com/search/">
          View all listings
        </a>
      </div>
    </section>
  );
}
