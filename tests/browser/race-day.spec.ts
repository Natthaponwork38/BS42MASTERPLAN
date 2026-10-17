import { test, expect } from '@playwright/test';

test('Race Day has four sections, correct static nutrition and all four routes', async ({ page }) => {
  await page.goto('./#/race-day');
  await expect(page).toHaveTitle('BS42 · Race Day');
  await expect(page.locator('.race-day>section>h2')).toHaveText(['Race Overview','Fueling Summary','Fueling Timeline','Packing Checklist']);
  await expect(page.locator('.race-event')).toHaveText('Bangsaen42');
  await expect(page.locator('.race-event-date time')).toHaveAttribute('datetime','2026-11-15');
  await expect(page.locator('.race-overview-values')).toContainText('42.195K');
  await expect(page.locator('.race-overview-values')).toContainText('Sub-4');
  await expect(page.locator('.race-overview-values')).toContainText('~5:41/km');
  await expect(page.locator('.race-nutrition dd')).toHaveText(['199g7 planned gels','70gBefore the race','29g1 extra gel','228gIncluding backup','~50g/hourOver 4 hours','75mgIn the Orange gel']);
  await expect(page.locator('.fueling-timeline .fueling-time')).toHaveText(['Pre-race','00:25','00:55','01:25','01:55','02:25','02:55','03:25','03:50']);
  await expect(page.locator('.fueling-timeline .fueling-product')).toHaveText(['ProEngy + AminoVITAL Blue','AminoVITAL Red','X-REAL Blackcurrant','AminoVITAL Red','X-REAL Blackcurrant','AminoVITAL Red','X-REAL C29+ Orange75mg caffeine','AminoVITAL Red','X-REAL BlackcurrantOptional backup']);
  await expect(page.locator('.fueling-timeline .fueling-carbs')).toHaveText(['70g carbohydrate','28g carbohydrate','29g carbohydrate','28g carbohydrate','29g carbohydrate','28g carbohydrate','29g carbohydrate','28g carbohydrate','29g carbohydrate']);
  await expect(page.locator('.fueling-timeline input,.fueling-timeline button,.fueling-timeline a,[role=progressbar],progress')).toHaveCount(0);
  await expect(page.locator('.race-day button')).toHaveText(['Reset Checklist']);
  await expect(page.locator('.race-notes')).toContainText('In-race drink carbohydrate is not included in the gel totals.');
  for (const [name,route] of [['Plan','plan'],['Long Run','long-run'],['Guardrails','guardrails'],['Race Day','race-day']]) {
    await page.getByRole('navigation').getByRole('link',{name,exact:true}).click();
    await expect(page).toHaveURL(new RegExp(`#/${route}$`));
    await expect(page).toHaveTitle(`BS42 · ${name}`);
  }
  await page.reload(); await expect(page.locator('.fueling-timeline>li')).toHaveCount(9);
});

test('five packing checkboxes persist independently of static fueling totals', async ({ page }) => {
  await page.goto('./#/race-day');
  const boxes=page.getByRole('checkbox');
  await expect(boxes).toHaveCount(5);
  await expect(page.locator('.packing-quantity')).toHaveText(['× 1','× 1','× 4','× 3','× 1']);
  await expect(page.getByRole('status')).toHaveText('0 / 5 product types packed');
  const nutrition=await page.locator('.race-nutrition').textContent();
  for (let i=0;i<5;i++) {
    await boxes.nth(i).focus(); await boxes.nth(i).press('Space');
    await expect(page.getByRole('status')).toHaveText(`${i+1} / 5 product types packed`);
  }
  await page.reload(); await expect(page.locator('input:checked')).toHaveCount(5);
  await page.getByRole('checkbox',{name:/Blackcurrant/}).uncheck();
  await page.getByRole('link',{name:'Guardrails',exact:true}).click();
  await page.getByRole('link',{name:'Race Day',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('4 / 5 product types packed');
  await expect(page.getByRole('checkbox',{name:/Blackcurrant/})).not.toBeChecked();
  expect(await page.locator('.race-nutrition').textContent()).toBe(nutrition);
  expect(await page.locator('.packing-item').evaluateAll(els=>els.every(el=>el.getBoundingClientRect().height>=44))).toBe(true);
  await expect(page.locator('.race-carry')).toHaveText('Total race gels to carry: 8');
});

test('reset needs confirmation and leaves theme and unrelated storage intact', async ({ page }) => {
  await page.addInitScript(() => {localStorage.setItem('bs42-theme','dark');localStorage.setItem('unrelated-preference','preserve');});
  await page.goto('./#/race-day');
  await page.getByRole('checkbox',{name:/AminoVITAL Red/}).check();
  page.once('dialog',async dialog=>{expect(dialog.type()).toBe('confirm');await dialog.dismiss();});
  await page.getByRole('button',{name:'Reset Checklist',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('1 / 5 product types packed');
  await page.reload(); await expect(page.getByRole('checkbox',{name:/AminoVITAL Red/})).toBeChecked();
  page.once('dialog',async dialog=>{expect(dialog.message()).toContain('5 product types');await dialog.accept();});
  await page.getByRole('button',{name:'Reset Checklist',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('0 / 5 product types packed');
  expect(await page.evaluate(()=>({packing:localStorage.getItem('bs42-race-day-packing-v1'),theme:localStorage.getItem('bs42-theme'),other:localStorage.getItem('unrelated-preference')}))).toEqual({packing:null,theme:'dark',other:'preserve'});
  await page.reload(); await expect(page.locator('input:checked')).toHaveCount(0);
});

test('invalid saved values and unavailable storage do not break packing', async ({ page }) => {
  await page.addInitScript(()=>localStorage.setItem('bs42-race-day-packing-v1','{"red":"true","orange":true,"unknown":true}'));
  await page.goto('./#/race-day');
  await expect(page.getByRole('status')).toHaveText('1 / 5 product types packed');
  await expect(page.getByRole('checkbox',{name:/Orange/})).toBeChecked();
  await page.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Denied','SecurityError');}}));
  await page.reload();
  await expect(page.getByRole('status')).toHaveText('0 / 5 product types packed');
  await page.getByRole('checkbox',{name:/ProEngy/}).check();
  await expect(page.getByRole('status')).toHaveText('1 / 5 product types packed');
  await expect(page.getByRole('alert')).toContainText('Browser storage is unavailable');
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Reset Checklist',exact:true}).click();
  await expect(page.getByRole('status')).toHaveText('0 / 5 product types packed');
});

test('capture Race Day mobile and desktop themes', async ({ page },testInfo) => {
  for (const theme of ['light','dark'] as const) {
    await page.emulateMedia({colorScheme:theme});
    await page.setViewportSize({width:430,height:932});
    await page.goto('./#/race-day'); await page.reload();
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:testInfo.outputPath(`race-day-${theme}-430.png`)});
    await page.getByRole('heading',{name:'Fueling Timeline',exact:true}).evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-40,behavior:'instant'}));
    await page.screenshot({path:testInfo.outputPath(`race-timeline-${theme}-430.png`)});
    await page.getByRole('checkbox',{name:/AminoVITAL Blue/}).check();
    await page.getByRole('checkbox',{name:/AminoVITAL Red/}).check();
    await page.getByRole('heading',{name:'Packing Checklist',exact:true}).evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-40,behavior:'instant'}));
    await page.screenshot({path:testInfo.outputPath(`race-packing-${theme}-430.png`)});
    await page.setViewportSize({width:1375,height:1029});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.screenshot({path:testInfo.outputPath(`race-day-${theme}-1375.png`)});
    await page.getByRole('heading',{name:'Packing Checklist',exact:true}).evaluate(el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-40,behavior:'instant'}));
    await page.screenshot({path:testInfo.outputPath(`race-packing-${theme}-1375.png`)});
  }
});
