export type StatsMode = "agent" | "office";

export type StatItem = {
  value: string;
  label: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  location: string;
};

export type Neighborhood = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
};

export type AgentProfile = {
  slug: string;
  name: string;
  firstName: string;
  title: string;
  phone: string;
  email: string;
  photo: string;
  heroImage: string;
  /** Optional square crop for roster / team cards */
  teamCardPhoto?: string;
  marketLine: string;
  headline: string;
  shortPitch: string;
  bio: string;
  statsMode: StatsMode;
  statsLabel: string;
  statsPeriod: string;
  stats: StatItem[];
  specialties: string[];
  testimonials: Testimonial[];
  neighborhoods: Neighborhood[];
  ghlAssignee: string;
};
