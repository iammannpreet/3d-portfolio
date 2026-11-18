import { site } from '../content/site'
import { Chapter } from '../scroll/Chapter'
import { Panel } from '../ui/Panel'
import { SectionHeader } from './SectionHeader'

/** Optional: the real bike, photos and favourite routes. Shown only when site.ride.enabled. */
export function MyRide() {
  const { ride } = site
  const title = ride.bike ? [ride.bike.name, ride.bike.year].filter(Boolean).join(', ') : 'What I ride'
  return (
    <Chapter id="my-ride" className="stage-safe split split--right">
      <div className="split__col">
        <Panel as="article" className="ride">
          <SectionHeader kicker="Off the clock · My ride" title={title} lead={ride.bike?.note} />
          {ride.intro && <p className="ui-body">{ride.intro}</p>}
          {ride.photos.length > 0 && (
            <ul className="ride__photos">
              {ride.photos.map((photo) => (
                <li key={photo.src}>
                  <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
                </li>
              ))}
            </ul>
          )}
          {ride.routes.length > 0 && (
            <>
              <h3 className="ui-label mt-5">Favourite routes</h3>
              <ul className="ride__routes">
                {ride.routes.map((route) => (
                  <li key={route.name}>
                    <span className="ride__route">{route.name}</span>
                    <span className="ui-body">{route.note}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>
    </Chapter>
  )
}
