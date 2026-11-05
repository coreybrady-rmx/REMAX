import { PUBLISH_FULL_ADDRESS, SHOW_RETURNS } from "./flags";
import { publicPath } from "./public-path";

export type RubyProject = {
  slug: string;
  heading: string;
  status: string;
  body: string;
  city: string;
  fullAddress: string;
  image: string;
  alt: string;
  returnPercent: string;
};

export const rubyProjects: RubyProject[] = [
  {
    slug: "ruby-hyrum",
    heading: "The Ruby, Hyrum, Utah",
    status: "Completed 2025, sold March 2026",
    body: "Six bedrooms, five bathrooms, and a three-car garage across 4,478 total square feet, with 2,985 square feet above grade. The home sits on a 0.30 acre lot in Hidden Valley Phase 2. Features include a gas fireplace, a covered patio, a den or office, a primary bath with a separate tub and shower, and a smart thermostat.",
    city: "Hyrum, Utah",
    fullAddress: "8 S 650 W, Hyrum, UT 84319",
    image: "/images/peaks-ruby-hyrum.jpg",
    alt: "Exterior of The Ruby, Hyrum, Utah",
    returnPercent: "18.4%",
  },
  {
    slug: "ruby-hyde-park",
    heading: "The Ruby, Hyde Park, Utah",
    status: "Completed 2025, sold April 2026",
    body: "Six bedrooms, five bathrooms, and a three-car garage across 4,478 total square feet, with 2,985 square feet above grade. The home sits on a 0.29 acre lot in Cedar Bluffs Phase 2. Features include a full basement with a wet bar, a gas fireplace, a covered deck and patio, instantaneous hot water, and a smart thermostat.",
    city: "Hyde Park, Utah",
    fullAddress: "128 N 900 E, Hyde Park, UT 84318",
    image: "/images/peaks-ruby-hyde-park.jpg",
    alt: "Exterior of The Ruby, Hyde Park, Utah",
    returnPercent: "16.8%",
  },
];

export function rubyProject(slug: string): RubyProject | undefined {
  return rubyProjects.find((project) => project.slug === slug);
}

export type RubyView = {
  slug: string;
  heading: string;
  status: string;
  body: string;
  image: string;
  alt: string;
  address: string | null;
  returnLine: string | null;
};

export function viewModel(
  project: RubyProject,
  options?: { showReturns?: boolean; fullAddress?: boolean },
): RubyView {
  const showReturns = options?.showReturns ?? SHOW_RETURNS;
  const fullAddress = options?.fullAddress ?? PUBLISH_FULL_ADDRESS;
  return {
    slug: project.slug,
    heading: project.heading,
    status: project.status,
    body: project.body,
    image: publicPath(project.image),
    alt: project.alt,
    address: fullAddress ? project.fullAddress : null,
    returnLine: showReturns ? `Return: ${project.returnPercent}` : null,
  };
}
