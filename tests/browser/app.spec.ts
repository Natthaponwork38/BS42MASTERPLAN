import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname } from 'node:path';
import type { AddressInfo } from 'node:net';
import { parseWorkbook } from '../../scripts/parser';
import contract from '../../data/source-contract.json' with { type: 'json' };
const source = parseWorkbook(readFileSync(contract.workbook));

test.beforeEach(async ({ page }) => { await page.clock.setFixedTime(new Date('2026-10-07T05:00:00+07:00')); });
test('430px Plan is complete, Today works and notes remain exact', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./');
  await expect(page.getByRole('navigation').getByRole('link')).toHaveCount(3);
  await expect(page.getByText('days to race')).toBeVisible();
  await expect(page.getByText('Week 2 / 7')).toBeVisible();
  await expect(page.locator('.training-week')).toHaveCount(7);
  await expect(page.locator('.timeline details')).toHaveCount(0);
  await expect(page.locator('.today-focus .today-run')).toHaveText('REST');
  await expect(page.locator('.current-week .week-heading')).toContainText('Week 2');
  for (const e of source.plan.entries) {
    const row = page.locator(`[data-sheet="BS42 Master Plan"][data-row="${e.row}"]`);
    await expect(row).toBeVisible();
    for (const label of ['Day','Phase','Run','Strength','Priority / Purpose','Status / Note']) await expect(row.locator(`[data-source-cell="${e.fields[label].address}"]`)).toHaveText(String(e.fields[label].value));
    await expect(row.locator('time')).toHaveAttribute('datetime',String(e.fields.Date.value));
  }
  await page.getByRole('button',{name:'Today',exact:true}).click();
  await expect.poll(async () => (await page.locator('#day-2026-10-07').boundingBox())!.y).toBeLessThan(100);
  const box = await page.locator('#day-2026-10-07').boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0); expect(box!.y).toBeLessThan(100);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('body')).not.toContainText(/Fueling Plan|ProEngy|PREVO|EXCLUDED_SENTINEL/);
  expect(errors).toEqual([]);
});
test('all Long Run and chart cells are accessible, with exact numeric precision', async ({ page }) => {
  await page.goto('./#/long-run');
  await expect(page.getByRole('heading',{name:'Long Run',exact:true})).toBeVisible();
  await expect(page.locator('svg')).toHaveCount(1);
  for (const e of source.longRun.entries) {
    const row = page.locator(`.roadmap-entry[data-row="${e.row}"]`);
    await row.locator('.source-values>summary').click();
    for (const label of ['Role','Target Min (km)','Target Max (km)','Planning Midpoint (km)']) await expect(row.locator(`[data-source-cell="${e.fields[label].address}"]`)).toHaveText(String(e.fields[label].value));
    await expect(row.locator('time')).toHaveAttribute('datetime',String(e.fields.Date.value));
    await expect(row.locator('.source-formula')).toContainText(e.fields['Planning Midpoint (km)'].formula!);
  }
  await page.locator('.chart-source>summary').click();
  for (const e of source.longRun.chart.entries) for (const c of Object.values(e.fields)) await expect(page.locator(`.chart-source-row [data-source-cell="${c.address}"]`)).toHaveText(String(c.value));
  await page.getByRole('button',{name:'Inspect 24 Oct'}).click();
  await expect(page.getByRole('status')).toHaveText('24 Oct · Min 24 · Max 26 · Mid 25 km');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('all Guardrails text and title are verbatim', async ({ page }) => {
  await page.goto('./#/guardrails');
  await expect(page.locator('.subtitle')).toHaveText(String(source.guardrails.title.value));
  for (const e of source.guardrails.entries) {
    const row = page.locator(`.guardrails [data-row="${e.row}"]`);
    await expect(row.locator('h2')).toHaveText(String(e.title.value));
    await expect(row.locator('p')).toHaveText(String(e.text.value));
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator('body').innerText()).not.toMatch(/\p{Extended_Pictographic}/u);
});
test('production service worker caches every asset and survives an unavailable origin', async ({ page, context, browserName }) => {
  // A dedicated no-store origin can be shut down without disrupting other tests.
  // WebKit setOffline rejects SW navigations: microsoft/playwright#42775.
  const base = process.env.BASE_PATH ?? '/';
  const root = resolve('dist');
  const types: Record<string,string> = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.png':'image/png', '.ttf':'font/ttf', '.webmanifest':'application/manifest+json' };
  const server = createServer(async (req,res) => {
    try {
      const path = new URL(req.url!, 'http://localhost').pathname;
      if (!path.startsWith(base)) { res.writeHead(404).end(); return; }
      const file = resolve(root, path.slice(base.length) || 'index.html');
      if (!file.startsWith(root+'/')) { res.writeHead(404).end(); return; }
      const bytes = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control':'no-store' }); res.end(bytes);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise<void>(done => server.listen(0,'127.0.0.1',done));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
  await page.goto(origin + base);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>(resolve => navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {once:true})); });
  await page.evaluate(() => document.fonts.ready);
  const cached = await page.evaluate(async () => { const names=await caches.keys(); return (await Promise.all(names.map(async n => (await (await caches.open(n)).keys()).map(r => new URL(r.url).pathname)))).flat(); });
  expect(cached.some(u => u.endsWith('material-symbols-rounded.ttf'))).toBe(true);
  expect(cached.some(u => u.includes('index-') && u.endsWith('.js'))).toBe(true);
  expect(cached.some(u => u.includes('icon-192.png'))).toBe(true);
  const requests: string[]=[];page.on('request',req=>requests.push(req.url()));
  server.closeAllConnections(); await new Promise<void>(done => server.close(() => done()));
  if (browserName === 'chromium') await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading',{name:'BS42',exact:true})).toBeVisible();
  const offlineTheme = await page.locator('html').getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  await page.getByRole('button',{name:`Switch to ${offlineTheme} mode`}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',offlineTheme);
  await page.getByRole('link',{name:'Long Run',exact:true}).click();
  await expect(page.locator('.roadmap-entry')).toHaveCount(8);
  await page.getByRole('link',{name:'Guardrails',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Fueling principle',exact:true})).toBeVisible();
  await page.reload(); await expect(page.getByRole('heading',{name:'Guardrails',exact:true})).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme',offlineTheme);
  expect(await page.evaluate(() => document.fonts.check('23px "Material Symbols Rounded"'))).toBe(true);
  expect(requests.filter(u => !u.startsWith(origin))).toEqual([]);
  } finally { server.closeAllConnections(); server.close(); }
});
test('manifest and all assets work under the configured Pages path', async ({ page, request }) => {
  await page.goto('./');
  const manifestHref = await page.locator('link[rel=manifest]').getAttribute('href');
  const response = await request.get(manifestHref!); expect(response.ok()).toBe(true);
  const manifest = await response.json();
  const base=process.env.BASE_PATH??'/';expect(manifest.start_url).toBe(base);expect(manifest.scope).toBe(base);expect(manifest.display).toBe('standalone');
  for(const icon of manifest.icons) expect((await request.get(`${base}${icon.src}`)).ok()).toBe(true);
  expect(await page.locator('meta[name=viewport]').getAttribute('content')).toContain('viewport-fit=cover');
  await expect(page.locator('.bottom-nav')).toHaveCSS('position','fixed');
});
test('small mobile and desktop widths have no horizontal overflow', async ({ page }) => {
  for(const width of [320,390,430,1024]) {
    await page.setViewportSize({width,height:932});
    for(const route of ['plan','long-run','guardrails']) {
      await page.goto(`./#/${route}`);
      await expect(page.locator('h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true);
    }
  }
});
test('capture mobile pages for visual QA', async ({ page }, testInfo) => {
  for (const theme of ['light','dark']) for (const route of ['plan','long-run','guardrails']) {
    await page.emulateMedia({ colorScheme: theme as 'light' | 'dark' });
    await page.goto(`./#/${route}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath(`${route}-${theme}-430.png`) });
    if (route === 'long-run') {
      await page.getByRole('button',{name:'Inspect 24 Oct'}).click();
      await page.screenshot({ path: testInfo.outputPath(`long-run-selected-${theme}-430.png`) });
    }
    if (route === 'guardrails') {
      await page.getByRole('heading',{name:'Pace guide',exact:true}).evaluate(el => window.scrollTo({top:el.getBoundingClientRect().top+scrollY-60,behavior:'instant'}));
      await page.screenshot({ path: testInfo.outputPath(`guardrails-pace-${theme}-430.png`) });
    }
    if (route === 'plan') {
      const today = page.locator('.today-section');
      await expect(today).toBeVisible();
      const bounds = await today.evaluate(el => ({ top: el.getBoundingClientRect().top + scrollY, height: el.getBoundingClientRect().height }));
      for (const [position,top] of [['entering',630],['centered',(932-bounds.height)/2],['leaving',100-bounds.height]] as const) {
        await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }),bounds.top-top);
        await page.screenshot({ path: testInfo.outputPath(`today-${theme}-${position}-430.png`) });
      }
    }
  }
  // Source workouts of different lengths must stay readable inside the highlight.
  for (const theme of ['light','dark'] as const) for (const date of ['2026-10-06','2026-10-08']) {
    await page.emulateMedia({ colorScheme: theme });
    await page.clock.setFixedTime(new Date(`${date}T05:00:00+07:00`));
    await page.goto('./#/plan'); await page.reload();
    const today = page.locator('.today-section');
    const row = source.plan.entries.find(e => e.fields.Date.value === date)!;
    await expect(today.locator('.run-field dd')).toHaveText(String(row.fields.Run.value));
    await today.evaluate(el => window.scrollTo({top:el.getBoundingClientRect().top+scrollY-40,behavior:'instant'}));
    await page.screenshot({ path: testInfo.outputPath(`today-${date}-${theme}-430.png`) });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

for (const [system,saved,expected] of [['dark',null,'dark'],['light',null,'light'],['light','dark','dark'],['dark','light','light']] as const) {
  test(`theme resolves before React: system ${system}, saved ${saved}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: system });
    if (saved) await page.addInitScript(value => localStorage.setItem('bs42-theme',value), saved);
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/assets/*.js', async route => { await gate; await route.continue(); });
    try {
      await page.goto('./', { waitUntil: 'commit' });
      await expect(page.locator('html')).toHaveAttribute('data-theme',expected);
      await expect(page.locator('html')).toHaveCSS('background-color', expected === 'dark' ? 'rgb(16, 17, 16)' : 'rgb(247, 247, 245)');
      await expect(page.locator('#root')).toBeEmpty();
      await expect(page.locator('meta[name=theme-color]')).toHaveAttribute('content',expected === 'dark' ? '#101110' : '#F7F7F5');
    } finally { release(); }
    await expect(page.getByRole('heading',{name:'BS42',exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:`Switch to ${expected === 'dark' ? 'light' : 'dark'} mode`})).toBeVisible();
  });
}
test('theme follows system until manually selected, persists across pages and reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' }); await page.goto('./');
  await expect(page.getByRole('heading',{name:'BS42',exact:true})).toBeVisible();
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.getByRole('button',{name:'Switch to light mode'}).press('Enter');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  expect(await page.evaluate(() => localStorage.getItem('bs42-theme'))).toBe('light');
  await page.getByRole('link',{name:'Long Run',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.getByRole('button',{name:'Switch to dark mode'}).click();
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(await page.evaluate(() => localStorage.getItem('bs42-theme'))).toBe('dark');
});
test('theme is usable when browser storage is denied', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}}); });
  await page.emulateMedia({ colorScheme: 'dark' }); await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.getByRole('button',{name:'Switch to light mode'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
test('both themes retain readable contrast, compact controls and only Material Symbols', async ({ page }) => {
  function luminance(rgb: string) {
    const [r,g,b] = rgb.match(/[\d.]+/g)!.slice(0,3).map(Number).map(v => v/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
    return .2126*r+.7152*g+.0722*b;
  }
  await page.emulateMedia({ colorScheme: 'light' }); await page.goto('./');
  for (const theme of ['light','dark']) {
    for (const route of ['plan','long-run','guardrails']) {
      await page.goto(`./#/${route}`);
      await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
      await expect(page.locator('footer')).toHaveCount(0);
      if (route === 'long-run') await page.getByRole('button',{name:'Inspect 24 Oct'}).click();
      const colors = await page.evaluate(() => {
        const background = (element: Element) => {
          for (let el: Element | null=element;el;el=el.parentElement) {
            const bg=getComputedStyle(el).backgroundColor;
            if (bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') return bg;
          }
          return getComputedStyle(document.documentElement).backgroundColor;
        };
        const selector='.key-value,.countdown strong,.roadmap-heading>p,.subtitle,.eyebrow,.today-tag,.today-section .day-context,.today-section dt,.today-section dd,.bottom-nav a[aria-current]>span:last-child,.theme-selected,.chart-reading,.chart-select button[aria-pressed=true]';
        return {
          text:[...document.querySelectorAll(selector)].map(el=>({color:getComputedStyle(el).color,bg:background(el)})),
          structure:[...document.querySelectorAll('.today-section,.bottom-nav a[aria-current] .material-symbols-rounded,.chart-selected')].map(el=>({
            color:el.matches('.today-section') ? getComputedStyle(el).borderLeftColor : el.matches('.chart-selected') ? getComputedStyle(el).fill : getComputedStyle(el).color,
            bg:background(el),
          })),
        };
      });
      for (const {color,bg} of colors.text) {
        const a=luminance(color), b=luminance(bg);
        expect((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toBeGreaterThanOrEqual(4.5);
      }
      for (const {color,bg} of colors.structure) {
        const a=luminance(color), b=luminance(bg);
        expect((Math.max(a,b)+.05)/(Math.min(a,b)+.05)).toBeGreaterThanOrEqual(3);
      }
      const toggle = await page.locator('.theme-toggle').boundingBox(); expect(toggle!.height).toBeGreaterThanOrEqual(44);
      const icons = await page.locator('.material-symbols-rounded').allTextContents();
      expect(icons.every(icon=>['calendar_month','route','rule','light_mode','dark_mode'].includes(icon))).toBe(true);
      expect(await page.locator('body').innerText()).not.toMatch(/\p{Extended_Pictographic}|Read-only training companion/u);
      if (route === 'long-run') {
        const boxes = await page.locator('.chart-select button').evaluateAll(els=>els.map(el=>({y:el.getBoundingClientRect().y,height:el.getBoundingClientRect().height})));
        expect(new Set(boxes.map(b=>b.y)).size).toBe(1); expect(boxes.every(b=>b.height>=44)).toBe(true);
      }
    }
    if (theme === 'light') await page.getByRole('button',{name:'Switch to dark mode'}).click();
  }
});
