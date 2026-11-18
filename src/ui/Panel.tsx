import { createElement, type HTMLAttributes, type ReactNode } from 'react'
import { cx } from './cx'

interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'aside' | 'section' | 'li' | 'figure' | 'blockquote'
  /** Drops the ember tick in the top-left corner. */
  plain?: boolean
  children?: ReactNode
}

/** The site's one surface: dark glass with chamfered corners, readable over the 3D scene. */
export function Panel({ as = 'div', plain, className, children, ...rest }: PanelProps) {
  return createElement(
    as,
    { ...rest, className: cx('ui-panel', plain && 'ui-panel--plain', className) },
    children,
  )
}
