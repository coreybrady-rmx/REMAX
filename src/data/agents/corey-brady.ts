import type { AgentProfile } from "../types";

/**
 * Pilot agent content pack.
 */
export const coreyBrady: AgentProfile = {
  slug: "corey-brady",
  name: "Corey Brady",
  firstName: "Corey",
  title: "Owner",
  phone: "435-799-7000",
  email: "coreybrady@remaxpeaks.com",
  photo:
    "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/50fa7f71-67aa-4587-8e5a-a97e82bbe574.jpg",
  heroImage:
    "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/50fa7f71-67aa-4587-8e5a-a97e82bbe574.jpg",
  teamCardPhoto:
    "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/ddf2fe7f-59b6-4c75-aabc-e58e6b6a6799.jpg",
  marketLine: "Cache Valley, Bear Lake, Southern Idaho",
  headline: "Elevating life's milestones in Cache Valley",
  shortPitch:
    "Local guidance for buying, selling, and building wealth, with clear next steps at every turn.",
  bio: "Corey Brady is a dedicated Realtor and owner with REMAX Peaks, serving Cache Valley and northern Utah. As part of The Allred Team, he guides families and investors through meaningful decisions. With over 8 years in real estate, new construction, and development, he offers clients more than guidance, he offers perspective. He treats every transaction as a partnership built on faith, integrity, and growth. Outside work, he enjoys golfing, reading, and spending time with his wife and five daughters.",
  statsMode: "office",
  statsLabel: "RE/MAX Peaks Cache Valley",
  stats: [
    { value: "$48M+", label: "Volume closed" },
    { value: "210+", label: "Transactions" },
    { value: "30", label: "Local agents" },
  ],
  specialties: [
    "Buyer representation",
    "Seller marketing",
    "New construction",
    "Investment property",
  ],
  testimonials: [
    {
      quote:
        "Corey made the process feel simple. We always knew the next step, and he fought for our family every day of the deal.",
      name: "The Jensen Family",
      location: "Logan, UT",
    },
    {
      quote:
        "From the first call to closing, communication was excellent. We sold faster than we expected and felt taken care of.",
      name: "Mark & Alyssa R.",
      location: "North Logan, UT",
    },
    {
      quote:
        "As first-time buyers we were nervous. Corey explained everything clearly and helped us find the right home in our budget.",
      name: "Emily S.",
      location: "Providence, UT",
    },
  ],
  neighborhoods: [
    {
      slug: "logan",
      name: "Logan",
      blurb:
        "University energy, downtown charm, and mountain access, the heart of Cache Valley living.",
      image:
        "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/68dda2185fb5bd01c9657833.jpeg",
    },
    {
      slug: "north-logan",
      name: "North Logan",
      blurb:
        "Family neighborhoods, newer builds, and quick access to shopping and schools.",
      image:
        "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/68dda2187f21196914842cbb.jpeg",
    },
    {
      slug: "providence",
      name: "Providence",
      blurb:
        "Quiet residential streets with strong community feel and nearby trail access.",
      image:
        "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/68dda218119b9e335fd8fe12.jpeg",
    },
    {
      slug: "nibley",
      name: "Nibley",
      blurb:
        "Growing community with newer homes and room to breathe just south of Logan.",
      image:
        "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/68dda21826a5e2eb3612e9e3.jpeg",
    },
    {
      slug: "preston",
      name: "Preston",
      blurb:
        "Idaho side of the valley: space, value, and a true small-town pace.",
      image:
        "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/68dda2ab26a5e2fa6c130428.jpeg",
    },
    {
      slug: "bear-lake",
      name: "Bear Lake",
      blurb:
        "Caribbean-blue water, cabin and second-home demand, and four-season recreation.",
      image:
        "https://assets.cdn.filesafe.space/gcRbh1s2WROIdnUcZoEy/media/68dda2957f2119a40584479a.jpeg",
    },
  ],
  ghlAssignee: "Corey Brady",
};

export const agents = {
  "corey-brady": coreyBrady,
} as const;

export function getAgent(slug: string) {
  return agents[slug as keyof typeof agents] ?? null;
}
