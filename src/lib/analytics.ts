declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(
  action: string,
  params: Record<string, string | number | boolean | undefined> = {},
) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", action, {
    ...params,
    send_to: process.env.NEXT_PUBLIC_GA_ID || "G-9L3N8P018T",
  });
}
