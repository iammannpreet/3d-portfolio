import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'

interface KickerProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode
}

/** The small monospace label above a heading, e.g. "Gear 2 · Stack". */
export function Kicker({ className, children, ...rest }: KickerProps) {
  return (
    <p {...rest} className={cx('ui-kicker', className)}>
      {children}
    </p>
  )
}
