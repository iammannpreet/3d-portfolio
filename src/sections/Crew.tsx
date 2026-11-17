import { useEffect, useRef } from 'react'
import { site } from '../content/site'
import { Chapter, Reveal } from '../scroll/Chapter'
import { registerReveal } from '../scroll/engine'
import { SectionHeader } from './SectionHeader'

/** Splits the chapter evenly between the quotes, with a short gap between each. */
function windows(count: number): { from: number; to: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    from: i === 0 ? 0 : i / count + 0.025,
    to: i === count - 1 ? 1 : (i + 1) / count - 0.025,
  }))
}

function Dot({ from, to }: { from: number; to: number }) {
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return registerReveal(el, 'pit-crew', from, to)
  }, [from, to])
  return <li ref={ref} />
}

/** 5: what colleagues say, one quote at a time. */
export function Crew() {
  const slots = windows(site.testimonials.length)
  return (
    <Chapter id="pit-crew" className="stage-safe crew">
      <SectionHeader kicker="Gear 5 · Pit crew" title="What people say" className="crew__header" />
      <div className="crew__quotes">
        {site.testimonials.map((testimonial, i) => (
          <Reveal key={testimonial.name} as="figure" from={slots[i]!.from} to={slots[i]!.to} className="quote">
            <blockquote>
              <p>{testimonial.quote}</p>
            </blockquote>
            <figcaption>
              <span className="quote__name">{testimonial.name}</span>
              <span className="quote__relation">{testimonial.relation}</span>
            </figcaption>
          </Reveal>
        ))}
      </div>
      <ol className="crew__dots" aria-hidden="true">
        {slots.map((slot, i) => (
          <Dot key={i} from={slot.from} to={slot.to} />
        ))}
      </ol>
    </Chapter>
  )
}
