import {
  createElement,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { chapterMeta, type ChapterId, type HotspotId } from '../chapters'
import { scriptFor } from './choreography'
import { registerReveal } from './engine'
import { ChapterContext, useChapterId } from './hooks'

interface ChapterProps {
  id: ChapterId
  /** Extra classes for the sticky stage. */
  className?: string
  children: ReactNode
}

/**
 * One chapter of the ride: a tall section whose `stage` sticks to the viewport while the page
 * scrolls through it. The section's height comes from the chapter's choreography script, so pacing
 * is tuned in one place. While it scrolls, the section carries `--p`, its 0..1 progress.
 *
 * Put a heading with id `${id}-title` inside (use <ChapterTitle>); the section is labelled by it.
 */
export function Chapter({ id, className, children }: ChapterProps) {
  const { length } = scriptFor(id)
  const style = { '--len-d': length.desktop, '--len-m': length.mobile } as CSSProperties
  return (
    <section
      id={id}
      data-chapter={id}
      aria-labelledby={`${id}-title`}
      className="chapter"
      style={style}
    >
      <div data-stage className={className ? `chapter-stage ${className}` : 'chapter-stage'}>
        <ChapterContext value={id}>{children}</ChapterContext>
      </div>
    </section>
  )
}

interface ChapterTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level. The hero uses 1; every other chapter uses 2. */
  level?: 1 | 2
  /** Defaults to the chapter's title from `chapters.ts`. */
  children?: ReactNode
}

/** The chapter's heading, with the id the section is labelled by. */
export function ChapterTitle({ level = 2, children, ...rest }: ChapterTitleProps) {
  const id = useChapterId()
  return createElement(
    level === 1 ? 'h1' : 'h2',
    { ...rest, id: `${id}-title` },
    children ?? chapterMeta(id).title,
  )
}

interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** Chapter progress (0..1) at which the element appears. */
  from?: number
  /** Chapter progress (0..1) after which it disappears. */
  to?: number
  /** Element to render. */
  as?: 'div' | 'article' | 'aside' | 'li' | 'section' | 'p' | 'ul' | 'ol' | 'header' | 'footer' | 'figure'
  /** When set, showing this element makes that hotspot the active one (leader line, marker). */
  hotspot?: HotspotId
  children?: ReactNode
}

/**
 * Shows its children only while the chapter's progress is inside from..to. Visible elements carry
 * `data-on`; the transition is styled in CSS. Hidden content stays readable by screen readers, and
 * focusing into it scrolls the page to where it is shown.
 */
export function Reveal({ from = 0, to = 1, as = 'div', hotspot, children, ...rest }: RevealProps) {
  const chapter = useChapterId()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerReveal(el, chapter, from, to, hotspot)
  }, [chapter, from, to, hotspot])

  return createElement(as, { ...rest, ref, 'data-reveal': '' }, children)
}
