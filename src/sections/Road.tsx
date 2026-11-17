import { useEffect, useRef } from 'react'
import { site } from '../content/site'
import { Chapter, Reveal } from '../scroll/Chapter'
import { roadBeats, type RoadBeat } from '../scroll/choreography/road'
import { registerReveal } from '../scroll/engine'
import { Panel } from '../ui/Panel'
import { Tags } from '../ui/Tags'
import { SectionHeader } from './SectionHeader'

function ProgressDot({ beat }: { beat: RoadBeat }) {
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerReveal(el, 'the-road', beat.from, beat.to)
  }, [beat])
  return <li ref={ref} />
}

/** 3: the bike rides; one gate and one card per milestone, oldest first. */
export function Road() {
  const beats = roadBeats(site.milestones.length)
  return (
    <Chapter id="the-road" className="stage-safe split split--right">
      <div className="split__col">
        <SectionHeader kicker="Gear 3 · The road so far" title="Experience" />
        <ol className="road-progress" aria-hidden="true">
          {beats.map((beat, i) => (
            <ProgressDot key={i} beat={beat} />
          ))}
        </ol>
        <ol className="milestones">
          {site.milestones.map((milestone, i) => {
            const beat = beats[i]
            if (!beat) return null
            return (
              <Reveal key={milestone.id} as="li" from={beat.from} to={beat.to} className="milestone">
                <Panel as="article">
                  <p className="milestone__meta">
                    <span className="milestone__kind">{milestone.kind === 'work' ? 'Work' : 'Education'}</span>
                    <span>{milestone.period}</span>
                  </p>
                  <h3 className="panel-title">{milestone.title}</h3>
                  <p className="milestone__org">
                    {milestone.org}
                    {milestone.place && <span> · {milestone.place}</span>}
                  </p>
                  <p className="ui-body">{milestone.summary}</p>
                  {milestone.highlights.length > 0 && (
                    <ul className="milestone__highlights">
                      {milestone.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                  <Tags items={milestone.tags} label="Tools" className="mt-4" />
                </Panel>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </Chapter>
  )
}
