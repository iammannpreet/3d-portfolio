import { useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import { chapterMeta, type ChapterId } from '../chapters'
import { scrollToChapter } from '../scroll/engine'
import { useActiveChapter, useChapterIds } from '../scroll/store'
import { cx } from '../ui/cx'
import { gearGlyph, shiftOrder } from './gears'

function go(event: MouseEvent<HTMLAnchorElement>, id: ChapterId) {
  event.preventDefault()
  scrollToChapter(id)
}

/**
 * Chapter navigation styled as a gear indicator. On wide screens it is a rail on the right edge;
 * on phones a button bottom-right that opens the list.
 */
export function GearNav() {
  const ids = useChapterIds()
  const active = useActiveChapter()
  const [open, setOpen] = useState(false)
  const sheetId = useId()
  const button = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    sheet.current?.querySelector<HTMLAnchorElement>('[aria-current]')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (!sheet.current?.contains(target) && !button.current?.contains(target)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  if (ids.length === 0) return null

  return (
    <>
      <nav aria-label="Chapters" className="gear-rail">
        <ol>
          {ids.map((id) => (
            <li key={id} style={{ order: shiftOrder(id) }}>
              <a
                href={`#${id}`}
                className={cx('gear-link', id === active && 'is-active')}
                aria-current={id === active ? 'step' : undefined}
                onClick={(event) => go(event, id)}
              >
                <span className="gear-link__glyph" aria-hidden="true">{gearGlyph(id)}</span>
                <span className="gear-link__label">{chapterMeta(id).nav}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="gear-mobile">
        <button
          ref={button}
          type="button"
          className="gear-mobile__button"
          aria-expanded={open}
          aria-controls={sheetId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="gear-mobile__glyph" aria-hidden="true">{gearGlyph(active)}</span>
          <span className="sr-only">Chapters, current: {chapterMeta(active).nav}</span>
        </button>
        <div ref={sheet} id={sheetId} className="gear-sheet" hidden={!open}>
          <nav aria-label="Chapters">
            <ol>
              {ids.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={cx('gear-sheet__link', id === active && 'is-active')}
                    aria-current={id === active ? 'step' : undefined}
                    onClick={(event) => {
                      go(event, id)
                      setOpen(false)
                      button.current?.focus()
                    }}
                  >
                    <span className="gear-link__glyph" aria-hidden="true">{gearGlyph(id)}</span>
                    <span>{chapterMeta(id).nav}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </>
  )
}
