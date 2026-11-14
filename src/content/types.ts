import type { HotspotId } from '../chapters'

export interface Link {
  label: string
  href: string
}

export interface Profile {
  /** Full name, e.g. "Manpreet Singh". */
  name: string
  /** Short form used in tight spots such as the top bar. */
  shortName: string
  /** Public handle without the @. */
  handle: string
  /** Job title shown in the hero. */
  headline: string
  /** One line under the headline. */
  tagline: string
  /** Two or three short paragraphs for the rider profile panel. */
  bio: string[]
  /** Shown only when set. */
  location: string | null
  email: string
  resumeUrl: string
  /** Imported asset URL, or null to show no photo. */
  photo: string | null
  /** Short label/value rows styled as HUD readouts, e.g. Experience / 3+ years. */
  facts: { label: string; value: string }[]
}

export interface Social {
  id: 'github' | 'linkedin' | 'instagram' | 'email' | 'resume'
  label: string
  href: string
}

/** One stop of The machine chapter: a part of the bike and the part of the stack it stands for. */
export interface StackGroup {
  hotspot: HotspotId
  /** The bike part, e.g. "Engine". */
  part: string
  /** The discipline, e.g. "Backend & APIs". */
  title: string
  /** One sentence tying the part to the discipline. */
  blurb: string
  skills: string[]
  /** Optional real result from experience that backs the claim. */
  proof?: string
}

export interface Milestone {
  id: string
  kind: 'education' | 'work'
  /** Human-readable dates, e.g. "Jun 2024 – present". */
  period: string
  /** Role or credential. */
  title: string
  org: string
  place?: string
  summary: string
  /** Up to three bullets. */
  highlights: string[]
  tags: string[]
}

export interface Project {
  id: string
  title: string
  blurb: string
  role?: string
  year?: string
  tags: string[]
  /** Imported asset URL, or null for no image. */
  image: string | null
  imageAlt: string
  links: Link[]
  /** Only featured projects are rendered. */
  featured: boolean
  /** True when the blurb was written from the repo's code and the owner has not confirmed it. */
  needsReview?: boolean
}

/** The real-world riding section. Rendered only when `enabled` is true. */
export interface Ride {
  enabled: boolean
  bike: { name: string; year?: string; note?: string } | null
  intro: string
  photos: { src: string; alt: string }[]
  routes: { name: string; note: string }[]
}

export interface Testimonial {
  quote: string
  name: string
  relation: string
}

/** Attribution for a third-party asset. Both 3D models are CC-BY-4.0 and require this. */
export interface Credit {
  title: string
  author: string
  authorUrl: string
  sourceUrl: string
  license: string
  licenseUrl: string
  /** What was changed from the original, as CC-BY asks. */
  changes: string
}

export interface SiteContent {
  meta: { siteUrl: string; title: string; description: string }
  profile: Profile
  socials: Social[]
  /** Skill names orbiting the helmet. Plain ASCII only: they are rendered with a subset font. */
  skillRings: { inner: string[]; outer: string[] }
  /** Lines typed out on the HUD while the visor is closed. */
  bootLog: string[]
  /** Exactly one entry per hotspot id, in HOTSPOT_IDS order. */
  stack: StackGroup[]
  /** Chronological, oldest first. */
  milestones: Milestone[]
  projects: Project[]
  ride: Ride
  testimonials: Testimonial[]
  credits: Credit[]
}
