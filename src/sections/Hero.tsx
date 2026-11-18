import { site } from '../content/site'
import { useReducedMotion } from '../lib/quality'
import { Chapter, ChapterTitle, Reveal } from '../scroll/Chapter'
import { scrollToChapter } from '../scroll/engine'
import { Button, ButtonLink } from '../ui/ButtonLink'
import { Icon } from '../ui/Icon'

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

/** N: name, title and the way in. */
export function Hero() {
  const reduced = useReducedMotion()
  const { profile, hero } = site

  return (
    <Chapter id="gear-up" className="stage-safe hero">
      <div className="hero__copy">
        <ChapterTitle level={1} className="hero__title">
          <span className="ui-kicker">{profile.name}</span>
          <span className="ui-title ui-title--hero hero__headline">{profile.headline}</span>
        </ChapterTitle>
        <p className="hero__tagline">{profile.tagline}</p>
        <div className="hero__actions">
          <Button
            icon="cog"
            spinIcon
            onClick={() =>
              scrollToChapter(
                'visor-down',
                reduced ? { at: 0.93, immediate: true } : { at: 0.93, duration: 4.6, easing: easeInOutSine },
              )
            }
          >
            {hero.cta}
          </Button>
          <ButtonLink variant="ghost" icon="arrow-up-right" href={profile.resumeUrl}>
            Résumé
          </ButtonLink>
        </div>
      </div>
      <Reveal from={0} to={0.2} className="hero__hint">
        <span>{hero.scrollHint}</span>
        <Icon name="chevron-down" size={16} />
      </Reveal>
    </Chapter>
  )
}
