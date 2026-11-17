// Captures the ride at fixed points so changes can be reviewed frame by frame.
//
//   node scripts/shots.ts [--url http://localhost:5173] [--sizes desktop,phone] [--only the-road]
//                         [--reduced] [--sheet] [--out shots]
//
// Needs a running dev or preview server and Google Chrome (Playwright drives the "chrome" channel).
// --sheet also writes one contact sheet per size, which is quicker to review.

import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { chromium, type Page } from '@playwright/test'
import sharp from 'sharp'

declare global {
  interface Window {
    __ride?: {
      bridge: { ready: { helmet: boolean; bike: boolean } }
      scroll: { chapters: unknown[] }
      chapterScrollY(id: string, at?: number): number | null
    }
  }
}

interface Stop {
  chapter: string
  at: number
  label: string
  /** The bike must be loaded for this frame to mean anything. */
  bike?: boolean
}

const STOPS: Stop[] = [
  { chapter: 'gear-up', at: 0, label: 'hero' },
  { chapter: 'gear-up', at: 1, label: 'hero-end' },
  { chapter: 'visor-down', at: 0.2, label: 'helmet-turns' },
  { chapter: 'visor-down', at: 0.33, label: 'helmet-over' },
  { chapter: 'visor-down', at: 0.56, label: 'boot-log', bike: true },
  { chapter: 'visor-down', at: 0.72, label: 'visor-opening', bike: true },
  { chapter: 'visor-down', at: 0.95, label: 'rider', bike: true },
  { chapter: 'the-machine', at: 0.03, label: 'machine-intro', bike: true },
  { chapter: 'the-machine', at: 0.12, label: 'engine', bike: true },
  { chapter: 'the-machine', at: 0.27, label: 'drivetrain', bike: true },
  { chapter: 'the-machine', at: 0.42, label: 'frame', bike: true },
  { chapter: 'the-machine', at: 0.57, label: 'tank', bike: true },
  { chapter: 'the-machine', at: 0.72, label: 'cockpit', bike: true },
  { chapter: 'the-machine', at: 0.87, label: 'brakes', bike: true },
  { chapter: 'the-road', at: 0.04, label: 'pulling-away', bike: true },
  { chapter: 'the-road', at: 0.14, label: 'milestone-1', bike: true },
  { chapter: 'the-road', at: 0.33, label: 'milestone-2', bike: true },
  { chapter: 'the-road', at: 0.51, label: 'milestone-3', bike: true },
  { chapter: 'the-road', at: 0.7, label: 'milestone-4', bike: true },
  { chapter: 'the-road', at: 0.88, label: 'milestone-5', bike: true },
  { chapter: 'the-garage', at: 0.08, label: 'garage-arrive', bike: true },
  { chapter: 'the-garage', at: 0.5, label: 'garage-cards', bike: true },
  { chapter: 'the-garage', at: 1, label: 'garage-end', bike: true },
  { chapter: 'pit-crew', at: 0.16, label: 'quote-1', bike: true },
  { chapter: 'pit-crew', at: 0.5, label: 'quote-2', bike: true },
  { chapter: 'kickstand-down', at: 0.6, label: 'contact', bike: true },
  { chapter: 'kickstand-down', at: 1, label: 'contact-end', bike: true },
]

const SIZES: Record<string, { width: number; height: number; scale: number }> = {
  desktop: { width: 1440, height: 900, scale: 1 },
  laptop: { width: 1280, height: 720, scale: 1 },
  tablet: { width: 768, height: 1024, scale: 1 },
  phone: { width: 390, height: 844, scale: 2 },
}

const { values } = parseArgs({
  options: {
    url: { type: 'string', default: 'http://localhost:5173' },
    sizes: { type: 'string', default: 'desktop,laptop,phone' },
    only: { type: 'string' },
    out: { type: 'string', default: 'shots' },
    reduced: { type: 'boolean', default: false },
    sheet: { type: 'boolean', default: false },
  },
})

async function settle(page: Page, needBike: boolean) {
  if (needBike) {
    await page.waitForFunction(() => window.__ride?.bridge.ready.bike === true, null, { timeout: 60_000 })
  }
  // Let the camera rig, the reveal transitions and the bloom settle.
  await page.waitForTimeout(1100)
}

async function run() {
  const only = values.only?.split(',')
  const stops = STOPS.filter((s) => !only || only.includes(s.chapter) || only.includes(s.label))
  const sizes = values.sizes!.split(',')
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const outDir = path.resolve(values.out!)
  await mkdir(outDir, { recursive: true })

  for (const sizeName of sizes) {
    const size = SIZES[sizeName]
    if (!size) throw new Error(`Unknown size "${sizeName}". Known: ${Object.keys(SIZES).join(', ')}`)
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      deviceScaleFactor: size.scale,
      reducedMotion: values.reduced ? 'reduce' : 'no-preference',
      isMobile: sizeName === 'phone',
      hasTouch: sizeName === 'phone',
    })
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(String(error)))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await page.goto(`${values.url}/?debug`, { waitUntil: 'load' })
    await page.waitForFunction(
      () => window.__ride && window.__ride.bridge.ready.helmet && window.__ride.scroll.chapters.length > 0,
      null,
      { timeout: 60_000 },
    )

    const files: string[] = []
    for (const [index, stop] of stops.entries()) {
      const y = await page.evaluate(([id, at]) => window.__ride!.chapterScrollY(id, at as number), [stop.chapter, stop.at] as const)
      if (y === null) continue
      await page.evaluate((top) => window.scrollTo(0, top), y)
      await settle(page, Boolean(stop.bike))
      const file = path.join(outDir, `${sizeName}-${String(index).padStart(2, '0')}-${stop.label}.png`)
      await page.screenshot({ path: file })
      files.push(file)
    }

    if (values.sheet && files.length > 0) {
      const cols = sizeName === 'phone' ? 6 : 4
      const cellW = sizeName === 'phone' ? 260 : 480
      const cellH = Math.round((cellW * size.height) / size.width)
      const tiles = await Promise.all(files.map((file) => sharp(file).resize(cellW, cellH).toBuffer()))
      const rows = Math.ceil(tiles.length / cols)
      await sharp({ create: { width: cols * cellW, height: rows * cellH, channels: 3, background: '#000' } })
        .composite(tiles.map((input, i) => ({ input, left: (i % cols) * cellW, top: Math.floor(i / cols) * cellH })))
        .png()
        .toFile(path.join(outDir, `sheet-${sizeName}.png`))
    }

    console.log(`${sizeName}: ${files.length} shots${errors.length ? `, ${errors.length} console errors:\n  ${errors.slice(0, 6).join('\n  ')}` : ''}`)
    await context.close()
  }
  await browser.close()
}

run().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
