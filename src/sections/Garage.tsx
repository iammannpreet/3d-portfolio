import { useRef, type CSSProperties, type FocusEvent } from 'react'
import { site } from '../content/site'
import type { Project } from '../content/types'
import { Chapter, Reveal } from '../scroll/Chapter'
import { GARAGE_PARKED_AT } from '../scroll/choreography'
import { scrollToChapter } from '../scroll/engine'
import { ButtonLink } from '../ui/ButtonLink'
import { Panel } from '../ui/Panel'
import { Tags } from '../ui/Tags'
import { SectionHeader } from './SectionHeader'

function initials(title: string): string {
  return title
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('')
}

function ProjectCard({ project }: { project: Project }) {
  const meta = [project.year, project.role].filter(Boolean).join(' · ')
  return (
    <Panel as="article" className="project">
      <div className="project__media">
        {project.image ? (
          <img src={project.image} alt={project.imageAlt} loading="lazy" decoding="async" />
        ) : (
          <div className="project__placeholder" aria-hidden="true">
            <span>{initials(project.title)}</span>
          </div>
        )}
      </div>
      <div className="project__body">
        {meta && <p className="project__meta">{meta}</p>}
        <h3 className="panel-title">{project.title}</h3>
        <p className="ui-body">{project.blurb}</p>
        <Tags items={project.tags} label={`${project.title} technologies`} className="mt-3" />
        {project.links.length > 0 && (
          <div className="project__links">
            {project.links.map((link) => (
              <ButtonLink key={link.href} variant="ghost" icon="arrow-up-right" href={link.href}>
                {link.label}
                <span className="sr-only">: {project.title}</span>
              </ButtonLink>
            ))}
          </div>
        )}
      </div>
    </Panel>
  )
}

/** 4: the bike parks; the projects slide past along the bottom as the page scrolls. */
export function Garage() {
  const projects = site.projects.filter((project) => project.featured)
  const viewport = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLUListElement>(null)

  // When keyboard focus reaches a card that has slid off screen, scroll until it is in view.
  const onFocus = (event: FocusEvent<HTMLLIElement>) => {
    const view = viewport.current
    const list = strip.current
    if (!view || !list) return
    const overflow = list.scrollWidth - view.clientWidth
    if (overflow <= 0) return
    const card = event.currentTarget
    const t = Math.min(1, Math.max(0, (card.offsetLeft - (view.clientWidth - card.offsetWidth) / 2) / overflow))
    scrollToChapter('the-garage', { at: GARAGE_PARKED_AT + t * (1 - GARAGE_PARKED_AT), immediate: true })
  }

  return (
    <Chapter id="the-garage" className="stage-safe garage">
      <SectionHeader kicker="Gear 4 · In the garage" title="Projects" />
      <Reveal from={GARAGE_PARKED_AT - 0.05} to={1} className="garage__viewport">
        <div ref={viewport} className="garage__window">
          <ul ref={strip} className="garage__strip" style={{ '--start': GARAGE_PARKED_AT } as CSSProperties}>
            {projects.map((project) => (
              <li key={project.id} onFocus={onFocus}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Chapter>
  )
}
