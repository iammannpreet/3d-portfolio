import type { ReactNode } from 'react'
import { ChapterTitle } from '../scroll/Chapter'
import { cx } from '../ui/cx'
import { Kicker } from '../ui/Kicker'

interface SectionHeaderProps {
  /** The ride-metaphor label, e.g. "Gear 2 · The machine". */
  kicker: string
  /** The plain heading, e.g. "The stack, part by part". */
  title: ReactNode
  lead?: string
  className?: string
}

/** Kicker, the chapter's h2 and an optional one-line lead. */
export function SectionHeader({ kicker, title, lead, className }: SectionHeaderProps) {
  return (
    <header className={cx('section-header', className)}>
      <Kicker>{kicker}</Kicker>
      <ChapterTitle className="ui-title">{title}</ChapterTitle>
      {lead && <p className="section-header__lead">{lead}</p>}
    </header>
  )
}
