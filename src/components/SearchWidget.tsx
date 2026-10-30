"use client";

import { trackEvent } from "@/lib/analytics";

type Props = {
  agentSlug: string;
  agentName: string;
  defaultCity?: string;
};

export function SearchWidget({
  agentSlug,
  agentName,
  defaultCity = "Logan",
}: Props) {
  return (
    <form
      className="search-widget"
      action="https://www.remaxpeaks.com/search/"
      method="GET"
      onSubmit={() => {
        trackEvent("agent_search_submit", {
          agent_slug: agentSlug,
          agent_name: agentName,
        });
      }}
    >
      <input type="hidden" name="agent" value={agentSlug} />
      <div className="search-field">
        <label htmlFor="sw-city">City</label>
        <input
          id="sw-city"
          name="city"
          type="text"
          defaultValue={defaultCity}
          placeholder="Any city"
        />
      </div>
      <div className="search-field">
        <label htmlFor="sw-min">Min price</label>
        <input
          id="sw-min"
          name="minPrice"
          type="number"
          min={0}
          step={1000}
          placeholder="No Min"
        />
      </div>
      <div className="search-field">
        <label htmlFor="sw-max">Max price</label>
        <input
          id="sw-max"
          name="maxPrice"
          type="number"
          min={0}
          step={1000}
          placeholder="No Max"
        />
      </div>
      <div className="search-field">
        <label htmlFor="sw-beds">Beds</label>
        <select id="sw-beds" name="beds" defaultValue="">
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
      </div>
      <button type="submit" className="btn btn-red search-submit">
        Search Listings
      </button>
    </form>
  );
}
