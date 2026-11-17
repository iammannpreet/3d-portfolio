import { site } from '../content/site'
import { Chapter, Reveal } from '../scroll/Chapter'
import { MACHINE_STOPS } from '../scroll/choreography'
import { Panel } from '../ui/Panel'
import { Tags } from '../ui/Tags'
import { SectionHeader } from './SectionHeader'

/** 2: the camera stops at six parts of the bike; each panel is the part of the stack it stands for. */
export function Machine() {
  const total = site.stack.length
  return (
    <Chapter id="the-machine" className="stage-safe split split--right">
      <div className="split__col">
        <SectionHeader
          kicker="Gear 2 · The machine"
          title="The stack, part by part"
          lead="Six parts of the bike. Six parts of the stack."
        />
        <div className="stack-panels">
          {site.stack.map((group, i) => {
            const stop = MACHINE_STOPS.find((s) => s.id === group.hotspot)
            if (!stop) return null
            return (
              <Reveal
                key={group.hotspot}
                as="article"
                from={stop.from - 0.02}
                to={stop.to + 0.02}
                hotspot={group.hotspot}
                data-hotspot-panel={group.hotspot}
                className="stack-panel"
              >
                <Panel>
                  <p className="panel-kicker">
                    <span>{group.part}</span>
                    <span className="panel-kicker__count">
                      {i + 1} / {total}
                    </span>
                  </p>
                  <h3 className="panel-title">{group.title}</h3>
                  <p className="ui-body">{group.blurb}</p>
                  <Tags items={group.skills} label={`${group.title} skills`} className="mt-4" />
                  {group.proof && (
                    <p className="proof">
                      <span className="ui-label">In practice</span>
                      <span>{group.proof}</span>
                    </p>
                  )}
                </Panel>
              </Reveal>
            )
          })}
        </div>
      </div>
    </Chapter>
  )
}
