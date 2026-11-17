import { site } from '../content/site'

/** Model credits (CC BY 4.0 requires them), a colophon and the copyright line. */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <section aria-labelledby="credits-title">
          <h2 id="credits-title" className="ui-label">
            3D model credits
          </h2>
          <ul className="credits">
            {site.credits.map((credit) => (
              <li key={credit.title}>
                <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {credit.title}
                </a>{' '}
                by{' '}
                <a href={credit.authorUrl} target="_blank" rel="noopener noreferrer">
                  {credit.author}
                </a>
                , licensed under{' '}
                <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer">
                  {credit.license}
                </a>
                . {credit.changes}
              </li>
            ))}
          </ul>
        </section>
        <div className="site-footer__meta">
          <p>Built with React Three Fiber, Lenis and GSAP.</p>
          <p>
            © {new Date().getFullYear()} {site.profile.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
