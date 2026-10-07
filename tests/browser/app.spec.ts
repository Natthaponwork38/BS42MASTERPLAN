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
  await page.locator('.earlier-days>summary').click();
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
    for (const label of ['Role','Target Min (km)','Target Max (km)','Planning Midpoint (km)']) await expect(row.locator(`[data-source-cell="${e.fields[label].address}"]`)).toHaveText(String(e.fields[label].value));
    await expect(row.locator('time')).toHaveAttribute('datetime',String(e.fields.Date.value));
    await row.locator('.formula-detail>summary').click();
    await expect(row.locator('.formula-detail p')).toContainText(e.fields['Planning Midpoint (km)'].formula!);
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
  await page.getByRole('link',{name:'Long Run',exact:true}).click();
  await expect(page.locator('.roadmap-entry')).toHaveCount(8);
  await page.getByRole('link',{name:'Guardrails',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Fueling principle',exact:true})).toBeVisible();
  await page.reload(); await expect(page.getByRole('heading',{name:'Guardrails',exact:true})).toBeVisible();
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
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} at ${width}px`).toBe(true);
    }
  }
});
test('capture mobile pages for visual QA', async ({ page }, testInfo) => {
  for (const route of ['plan','long-run','guardrails']) {
    await page.goto(`./#/${route}`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: testInfo.outputPath(`${route}-430.png`) });
  }
});
