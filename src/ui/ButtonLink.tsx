import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'
import { Icon, type IconName } from './Icon'

interface Shared {
  variant?: 'primary' | 'ghost'
  icon?: IconName
  /** Spins the icon while the pointer is over the button (the 2024 cog button did this). */
  spinIcon?: boolean
  children?: ReactNode
}

function content({ icon, spinIcon, children }: Shared) {
  return (
    <>
      <span>{children}</span>
      {icon && <Icon name={icon} size={16} className={cx(spinIcon && 'ui-btn__spin')} />}
    </>
  )
}

type ButtonLinkProps = Shared & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/** A link styled as a button. External links open in a new tab safely. */
export function ButtonLink({ variant = 'primary', icon, spinIcon, className, children, href, ...rest }: ButtonLinkProps) {
  const external = /^https?:\/\//.test(href)
  return (
    <a
      {...rest}
      href={href}
      target={external ? '_blank' : rest.target}
      rel={external ? 'noopener noreferrer' : rest.rel}
      className={cx('ui-btn', `ui-btn--${variant}`, className)}
    >
      {content({ icon, spinIcon, children })}
    </a>
  )
}

type ButtonProps = Shared & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ variant = 'primary', icon, spinIcon, className, children, ...rest }: ButtonProps) {
  return (
    <button type="button" {...rest} className={cx('ui-btn', `ui-btn--${variant}`, className)}>
      {content({ icon, spinIcon, children })}
    </button>
  )
}
