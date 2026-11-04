export type PlanImage = {
  src: string;
  title: string;
};

export const planRenderings: Record<string, PlanImage> = {
  alpine: { src: "/plans/alpine/rendering.jpg", title: "Alpine exterior rendering" },
  balsa: { src: "/plans/balsa/rendering.jpg", title: "Balsa exterior rendering" },
  heritage: { src: "/plans/heritage/rendering.jpg", title: "Heritage exterior rendering" },
  juniper: { src: "/plans/juniper/rendering.jpg", title: "Juniper exterior rendering" },
  sage: { src: "/plans/sage/rendering.jpg", title: "Sage exterior rendering" },
  sumac: { src: "/plans/sumac/rendering.jpg", title: "Sumac exterior rendering" },
};

export const planDiagrams: Record<string, PlanImage[]> = {
  alpine: [
    { src: "/plans/alpine/main.jpg", title: "Alpine main level" },
    { src: "/plans/alpine/basement.jpg", title: "Alpine basement" },
  ],
  balsa: [{ src: "/plans/balsa/main.jpg", title: "Balsa main level" }],
  heritage: [
    { src: "/plans/heritage/main.jpg", title: "Heritage main level" },
    { src: "/plans/heritage/upper.jpg", title: "Heritage upper level" },
    { src: "/plans/heritage/basement.jpg", title: "Heritage basement" },
  ],
  juniper: [{ src: "/plans/juniper/main.jpg", title: "Juniper main level" }],
  sage: [
    { src: "/plans/sage/main.jpg", title: "Sage main level" },
    { src: "/plans/sage/basement.jpg", title: "Sage basement" },
  ],
  sumac: [],
};

export function renderingFor(slug: string): PlanImage | undefined {
  return planRenderings[slug];
}
