import type { ReactNode } from 'react'

export type IconName =
  | 'github'
  | 'linkedin'
  | 'instagram'
  | 'mail'
  | 'resume'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'chevron-down'
  | 'cog'
  | 'copy'
  | 'check'
  | 'motion'

interface IconDef {
  viewBox: string
  /** `fill` icons are solid shapes; `stroke` icons are 1.75px outlines. */
  mode: 'fill' | 'stroke'
  body: ReactNode
}

const ICONS: Record<IconName, IconDef> = {
  // GitHub mark, from Octicons (MIT).
  github: {
    viewBox: '0 0 16 16',
    mode: 'fill',
    body: (
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    ),
  },
  linkedin: {
    viewBox: '0 0 24 24',
    mode: 'fill',
    body: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="8" cy="8.1" r="1.15" />
        <rect x="7" y="10.4" width="2" height="6.6" />
        <path d="M11.3 10.4h1.95v.95c.5-.75 1.3-1.15 2.3-1.15 1.6 0 2.45 1 2.45 2.8V17h-2v-3.6c0-.85-.4-1.3-1.1-1.3-.85 0-1.6.5-1.6 1.6V17h-2z" />
      </>
    ),
  },
  instagram: {
    viewBox: '0 0 24 24',
    mode: 'stroke',
    body: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  mail: {
    viewBox: '0 0 24 24',
    mode: 'stroke',
    body: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3.6 7.2 12 13l8.4-5.8" />
      </>
    ),
  },
  resume: {
    viewBox: '0 0 24 24',
    mode: 'stroke',
    body: (
      <>
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5M10 13h6M10 17h6" />
      </>
    ),
  },
  'arrow-right': {
    viewBox: '0 0 24 24',
    mode: 'stroke',
    body: <path d="M5 12h14M13 6l6 6-6 6" />,
  },
  'arrow-up-right': {
    viewBox: '0 0 24 24',
    mode: 'stroke',
    body: <path d="M7 17 17 7M9 7h8v8" />,
  },
  'chevron-down': {
    viewBox: '0 0 24 24',
    mode: 'stroke',
    body: <path d="m6 9 6 6 6-6" />,
  },
  // The cog from the 2024 "Know me Better" button (Heroicons, MIT).
  cog: {
    viewBox: '0 0 20 20',
    mode: 'fill',
    body: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
      />
    ),
  },
  copy: {
    viewBox: '0 0 24 24',
    mode: 'stroke',
    body: (
      <>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V6a2 2 0 0 1 2-2h9" />
      </>
    ),
  },
  check: {
    viewBox: '0 0 24 24',
    mode: 'stroke',
    body: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  },
  motion: {
    viewBox: '0 0 24 24',
    mode: 'stroke',
    body: <path d="M3 12c3-7 6-7 9 0s6 7 9 0" />,
  },
}

interface IconProps {
  name: IconName
  /** Width and height in CSS pixels. */
  size?: number
  className?: string
}

/** A decorative icon. Always pair it with visible or screen-reader text. */
export function Icon({ name, size = 18, className }: IconProps) {
  const icon = ICONS[name]
  const stroke = icon.mode === 'stroke'
  return (
    <svg
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : undefined}
      strokeWidth={stroke ? 1.75 : undefined}
      strokeLinecap={stroke ? 'round' : undefined}
      strokeLinejoin={stroke ? 'round' : undefined}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {icon.body}
    </svg>
  )
}
