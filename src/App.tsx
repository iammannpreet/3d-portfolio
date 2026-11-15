import { useEffect } from 'react'
import { site } from './content/site'
import { Hud } from './hud/Hud'
import { Loader } from './hud/Loader'
import { VisorOverlay } from './hud/VisorOverlay'
import { SceneHost } from './scene/SceneHost'
import { initScroll } from './scroll/engine'
import { Contact } from './sections/Contact'
import { Crew } from './sections/Crew'
import { Footer } from './sections/Footer'
import { Garage } from './sections/Garage'
import { Hero } from './sections/Hero'
import { Machine } from './sections/Machine'
import { MyRide } from './sections/MyRide'
import { Road } from './sections/Road'
import { Visor } from './sections/Visor'

/**
 * Layers, back to front:
 *   SceneHost     fixed WebGL canvas (or a static backdrop)          z 0
 *   VisorOverlay  blackout + HUD boot log during "Visor down"        z 5
 *   main          the chapters: ordinary, readable HTML              z 10
 *   Hud           gear indicator, speedo, trip bar, leader lines     z 20
 *   Loader        covers everything until the hero is ready          z 50
 */
export default function App() {
  // Child effects run first, so every chapter section is in the DOM by the time this measures.
  useEffect(() => initScroll(), [])

  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <SceneHost />
      <VisorOverlay />
      <Hud />
      <main id="content">
        <Hero />
        <Visor />
        <Machine />
        <Road />
        <Garage />
        {site.ride.enabled && <MyRide />}
        <Crew />
        <Contact />
      </main>
      <Footer />
      <Loader />
    </>
  )
}
