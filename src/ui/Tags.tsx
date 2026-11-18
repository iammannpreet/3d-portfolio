import { cx } from './cx'

interface TagsProps {
  items: readonly string[]
  /** What the list is, for screen readers, e.g. "Technologies". */
  label: string
  className?: string
}

/** A wrapping row of small monospace tags. */
export function Tags({ items, label, className }: TagsProps) {
  if (items.length === 0) return null
  return (
    <ul aria-label={label} className={cx('ui-tags', className)}>
      {items.map((item) => (
        <li key={item} className="ui-tag">
          {item}
        </li>
      ))}
    </ul>
  )
}
