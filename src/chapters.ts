/**
 * The chapters of the ride, in scroll order.
 *
 * This list is the single source of truth for chapter ids. The DOM sections, the HUD gear
 * indicator and the camera choreography all key off it.
 */
export const CHAPTER_IDS = [
  'gear-up',
  'visor-down',
  'the-machine',
  'the-road',
  'the-garage',
  'my-ride',
  'pit-crew',
  'kickstand-down',
] as const

export type ChapterId = (typeof CHAPTER_IDS)[number]

export type Gear = 'N' | '1' | '2' | '3' | '4' | '5' | '6'

export interface ChapterMeta {
  id: ChapterId
  /** Position on the HUD gear indicator. `null` means the chapter is not a gear stop. */
  gear: Gear | null
  /** Section heading. */
  title: string
  /** Plain-language label used in navigation. */
  nav: string
}

export const CHAPTERS: readonly ChapterMeta[] = [
  { id: 'gear-up', gear: 'N', title: 'Gear up', nav: 'Start' },
  { id: 'visor-down', gear: '1', title: 'Visor down', nav: 'Rider' },
  { id: 'the-machine', gear: '2', title: 'The machine', nav: 'Stack' },
  { id: 'the-road', gear: '3', title: 'The road so far', nav: 'Experience' },
  { id: 'the-garage', gear: '4', title: 'In the garage', nav: 'Projects' },
  { id: 'my-ride', gear: null, title: 'My ride', nav: 'My ride' },
  { id: 'pit-crew', gear: '5', title: 'Pit crew', nav: 'Testimonials' },
  { id: 'kickstand-down', gear: '6', title: 'Kickstand down', nav: 'Contact' },
]

export function chapterMeta(id: ChapterId): ChapterMeta {
  const meta = CHAPTERS.find((c) => c.id === id)
  if (!meta) throw new Error(`Unknown chapter: ${id}`)
  return meta
}

/**
 * The six parts of the bike that The machine chapter stops at. Content (the stack group shown at
 * each stop), the scene (where the leader line lands) and the choreography all key off these ids.
 */
export const HOTSPOT_IDS = ['engine', 'drivetrain', 'frame', 'tank', 'cockpit', 'brakes'] as const

export type HotspotId = (typeof HOTSPOT_IDS)[number]
