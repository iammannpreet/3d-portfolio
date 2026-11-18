import { site } from '../content/site'
import { scrollToChapter } from '../scroll/engine'
import { Icon } from '../ui/Icon'
import { MotionToggle } from './MotionToggle'

/** Always-visible top bar: the name (back to the start), the motion toggle and the résumé. */
export function TopBar() {
  return (
    <header className="hud-top">
      <a
        href="#gear-up"
        className="hud-brand"
        onClick={(event) => {
          event.preventDefault()
          scrollToChapter('gear-up')
        }}
      >
        <span className="hud-brand__mark" aria-hidden="true" />
        <span>{site.profile.name}</span>
      </a>
      <div className="hud-top__actions">
        <MotionToggle />
        <a className="hud-chip hud-chip--accent" href={site.profile.resumeUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="resume" size={16} />
          <span className="hud-chip__label">Résumé</span>
        </a>
      </div>
    </header>
  )
}
