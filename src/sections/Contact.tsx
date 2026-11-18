import { useEffect, useState } from 'react'
import { site } from '../content/site'
import type { Social } from '../content/types'
import { Chapter } from '../scroll/Chapter'
import { Button } from '../ui/ButtonLink'
import { Icon, type IconName } from '../ui/Icon'
import { Panel } from '../ui/Panel'
import { SectionHeader } from './SectionHeader'

const ICONS: Record<Social['id'], IconName> = {
  github: 'github',
  linkedin: 'linkedin',
  instagram: 'instagram',
  email: 'mail',
  resume: 'resume',
}

/** 6: how to get in touch. */
export function Contact() {
  const { email } = site.profile
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2400)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
    } catch {
      // Clipboard access can be refused; the address is still on screen to select by hand.
      setCopied(false)
    }
  }

  return (
    <Chapter id="kickstand-down" className="stage-safe split split--left">
      <div className="split__col">
        <Panel as="article" className="contact">
          <SectionHeader kicker="Gear 6 · Kickstand down" title={site.contact.heading} lead={site.contact.blurb} />
          <div className="contact__email">
            <a className="contact__address" href={`mailto:${email}`}>
              {email}
            </a>
            <Button variant="ghost" icon={copied ? 'check' : 'copy'} onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <span className="sr-only" role="status">
              {copied ? 'Email address copied' : ''}
            </span>
          </div>
          <ul className="dock">
            {site.socials.map((social) => {
              const external = /^https?:/.test(social.href)
              return (
                <li key={social.id}>
                  <a
                    href={social.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                  >
                    <Icon name={ICONS[social.id]} size={20} />
                    <span>{social.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>
    </Chapter>
  )
}
