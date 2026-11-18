import { site } from '../content/site'
import { Chapter, Reveal } from '../scroll/Chapter'
import { VISOR_BEATS } from '../scroll/choreography'
import { Panel } from '../ui/Panel'
import { SectionHeader } from './SectionHeader'

/** 1: the screen goes dark, the HUD boots, the visor opens on the bike. Then the rider profile. */
export function Visor() {
  const { profile } = site
  return (
    <Chapter id="visor-down" className="stage-safe split split--right">
      <Reveal from={VISOR_BEATS.openAt + 0.02} to={1} className="split__col">
        <Panel as="article" className="rider">
          <SectionHeader kicker="Gear 1 · Visor down" title="The rider" />
          {profile.photo && (
            <img className="rider__photo" src={profile.photo} alt={`${profile.name}`} width={96} height={96} loading="lazy" decoding="async" />
          )}
          <div className="rider__bio">
            {profile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="readouts">
            {profile.facts.map((fact) => (
              <div key={fact.label}>
                <dt className="ui-label">{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </Reveal>
    </Chapter>
  )
}
