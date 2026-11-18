import type { ChapterId } from '../../chapters'
import { site } from '../../content/site'
import type { ChapterScript } from '../types'
import { garage } from './garage'
import { gearUp } from './gearUp'
import { kickstandDown } from './kickstandDown'
import { machine } from './machine'
import { myRide } from './myRide'
import { pitCrew } from './pitCrew'
import { road } from './road'
import { visorDown } from './visorDown'

/** Every chapter's camera script, in scroll order. */
export const SCRIPTS: readonly ChapterScript[] = [
  gearUp,
  visorDown,
  machine,
  road(site.milestones.length),
  garage,
  myRide,
  pitCrew,
  kickstandDown,
]

export function scriptFor(id: ChapterId): ChapterScript {
  const script = SCRIPTS.find((s) => s.chapter === id)
  if (!script) throw new Error(`No choreography for chapter: ${id}`)
  return script
}

export { MACHINE_STOPS } from './machine'
export { roadBeats } from './road'
export { VISOR_BEATS } from './visorDown'
export { GARAGE_PARKED_AT } from './garage'
