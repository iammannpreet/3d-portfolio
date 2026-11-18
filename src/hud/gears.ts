import { chapterMeta, type ChapterId } from '../chapters'

/** The glyph shown for a chapter on the gear indicator. Chapters without a gear show a dot. */
export function gearGlyph(id: ChapterId): string {
  return chapterMeta(id).gear ?? '•'
}

/**
 * Visual order on the rail follows a motorcycle's shift pattern: 1 sits above N, then 2 to 6.
 * The DOM (and so keyboard) order stays in page order.
 */
export function shiftOrder(id: ChapterId): number {
  const gear = chapterMeta(id).gear
  if (gear === '1') return 0
  if (gear === 'N') return 10
  if (gear === null) return 45
  return Number(gear) * 10
}
