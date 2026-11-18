import { expect, test, type Page } from '@playwright/test'

const CHAPTERS = ['gear-up', 'visor-down', 'the-machine', 'the-road', 'the-garage', 'pit-crew', 'kickstand-down']

/** Console errors, minus the deprecation notice three.js prints for React Three Fiber's clock. */
function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(String(error)))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}

async function waitForScene(page: Page) {
  await page.waitForFunction(() => window.__ride?.bridge.ready.helmet === true, null, { timeout: 60_000 })
}

test('loads cleanly, with no requests to other sites', async ({ page, baseURL }) => {
  const errors = collectErrors(page)
  const foreign: string[] = []
  page.on('request', (request) => {
    const url = request.url()
    if (!url.startsWith(baseURL!) && !url.startsWith('data:') && !url.startsWith('blob:')) foreign.push(url)
  })
  await page.goto('/?debug')
  await waitForScene(page)
  await expect(page.locator('.loader')).toHaveCount(0, { timeout: 10_000 })
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Manpreet Singh\s*Backend Software Engineer/)
  expect(errors).toEqual([])
  expect(foreign).toEqual([])
})

test('every chapter is on the page, labelled by its heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveCount(1)
  for (const id of CHAPTERS) {
    const section = page.locator(`section#${id}`)
    await expect(section).toHaveCount(1)
    const labelledBy = await section.getAttribute('aria-labelledby')
    await expect(page.locator(`#${labelledBy}`)).toHaveCount(1)
  }
})

test('the gear navigation reaches every chapter', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Covered by the phone sheet test')
  await page.goto('/?debug')
  await waitForScene(page)
  const rail = page.getByRole('navigation', { name: 'Chapters' }).first()
  for (const id of [...CHAPTERS].reverse()) {
    await rail.locator(`a[href="#${id}"]`).click()
    await expect.poll(() => page.evaluate(() => window.__ride!.scroll.active), { timeout: 10_000 }).toBe(id)
    await expect(rail.locator(`a[href="#${id}"]`)).toHaveAttribute('aria-current', 'step')
  }
})

test('the phone chapter sheet opens, navigates and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phones only')
  await page.goto('/?debug')
  await waitForScene(page)
  const button = page.locator('.gear-mobile__button')
  await button.click()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
  await page.locator('.gear-sheet a[href="#the-road"]').click()
  await expect(button).toHaveAttribute('aria-expanded', 'false')
  await expect.poll(() => page.evaluate(() => window.__ride!.scroll.active), { timeout: 10_000 }).toBe('the-road')
})

test('links are real and safe', async ({ page }) => {
  await page.goto('/')
  const external = page.locator('a[target="_blank"]')
  expect(await external.count()).toBeGreaterThan(5)
  for (const rel of await external.evaluateAll((links) => links.map((a) => a.getAttribute('rel')))) {
    expect(rel).toContain('noopener')
  }
  await expect(page.locator('a[href="mailto:contact@iammannpreet.com"]').first()).toBeAttached()
  await expect(page.locator('a[href*="myResume"]').first()).toBeAttached()
})

test('reduced motion is respected and can be switched', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced')
  const toggle = page.getByRole('button', { name: 'Reduce motion' })
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await toggle.click()
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full')
  await context.close()
})

test('without WebGL the page still reads', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/?webgl=off')
  await expect(page.locator('html')).toHaveAttribute('data-scene', 'unsupported')
  await expect(page.locator('.loader')).toHaveCount(0, { timeout: 10_000 })
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Experience' })).toBeAttached()
  await expect(page.getByText('Thrive Creative').first()).toBeAttached()
  expect(errors).toEqual([])
})

test('"Know me better" plays the visor transition and lands on the rider', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Same behaviour on phones; checked on desktop')
  await page.goto('/?debug')
  await waitForScene(page)
  await page.getByRole('button', { name: 'Know me better' }).click()
  await expect.poll(() => page.evaluate(() => window.__ride!.scroll.active), { timeout: 10_000 }).toBe('visor-down')
  await expect(page.getByRole('heading', { name: 'The rider' })).toBeInViewport({ timeout: 10_000 })
})

test('keyboard focus brings an off-screen project into view', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Keyboard navigation is checked on desktop')
  await page.goto('/?debug')
  await waitForScene(page)
  const lastProjectLink = page.locator('.garage__strip > li').last().getByRole('link').first()
  await lastProjectLink.focus()
  await expect.poll(() => page.evaluate(() => window.__ride!.scroll.active), { timeout: 10_000 }).toBe('the-garage')
  await expect(lastProjectLink).toBeInViewport({ ratio: 1 })
})
