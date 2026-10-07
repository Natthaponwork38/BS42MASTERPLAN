import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { unzipSync, zipSync, strFromU8, strToU8 } from 'fflate';
import { parseWorkbook } from '../scripts/parser';
import contract from '../data/source-contract.json' with { type: 'json' };
import { calendarDate, deriveSummary } from '../src/lib/dates';
import { XMLParser } from 'fast-xml-parser';
import type { Cell } from '../scripts/parser';

const source = readFileSync(contract.workbook);
function change(path: string, edit: (xml: string) => string) {
  const files = unzipSync(source);
  const before = strFromU8(files[path]), after = edit(before);
  assert.notEqual(before, after, 'Mutation must change the fixture');
  files[path] = strToU8(after);
  return Buffer.from(zipSync(files));
}
const sheet = (i:number) => `xl/worksheets/sheet${i}.xml`;
test('independent raw Excel XML reconciliation checks every value and formula', () => {
  const files = unzipSync(source);
  const xml = new XMLParser({ removeNSPrefix: true, ignoreAttributes: false, attributeNamePrefix: '', parseTagValue: false });
  const d = parseWorkbook(source);
  function collect(value: unknown, result: Cell[] = []): Cell[] {
    if (value && typeof value === 'object') {
      if ('address' in value && 'raw' in value) result.push(value as Cell);
      else Object.values(value).forEach(v => collect(v,result));
    }
    return result;
  }
  for (const [index, generated] of [[1,d.plan],[2,d.longRun],[3,d.guardrails]] as const) {
    const rows = xml.parse(strFromU8(files[sheet(index)])).worksheet.sheetData.row;
    const cells = rows.flatMap((r: {c: unknown[]}) => r.c).filter((c: {v?:string}) => c.v !== undefined && c.v !== '');
    const mapped = new Map(collect(generated).map(c => [c.address,c]));
    assert.equal(mapped.size,cells.length);
    for (const c of cells) { const g = mapped.get(c.r)!; assert.ok(g, `Unmapped ${index}!${c.r}`); assert.equal(String(g.raw),c.v); if (c.f) assert.equal(g.formula,`=${c.f}`); }
  }
});
test('required sheet absence fails', () => assert.throws(() => parseWorkbook(change('xl/workbook.xml',x => x.replace('name="Guardrails"','name="Other"'))), /Missing required sheet/));
test('all three sheets reconcile all 462 non-empty cells and all records', () => {
  const d = parseWorkbook(source);
  assert.deepEqual(d.audit.map(a => [a.sourceRecords,a.sourceCells,a.mappedCells]), [[49,350,350],[8,81,81],[15,31,31]]);
  assert.equal(d.longRun.chart.entries.length, 8);
  assert.equal(d.raceDate,'2026-11-15');
  assert.equal(d.longRun.entries.at(-1)!.fields['Planning Midpoint (km)'].value,42.195);
  assert.equal(d.longRun.chartTitle,'Long Run Progression to Bangsaen42');
});
test('the excluded sheet contributes no generated values', () => {
  const mutated = change(sheet(4), xml => xml.replace('SATURDAY LONG RUN FUELING — 10 OCT 2026','EXCLUDED_SENTINEL_882')); 
  assert.deepEqual(parseWorkbook(mutated), parseWorkbook(source));
  const json = JSON.stringify(parseWorkbook(source));
  assert.ok(!json.includes('Fueling Plan') && !json.includes('ProEngy') && !json.includes('PREVO'));
  assert.ok(json.includes('Fueling principle'));
});
test('unattached or excluded-sheet chart content is not extracted', () => {
  const files = unzipSync(source);
  files['xl/drawings/charts/excluded-chart.xml'] = strToU8('<chart>EXCLUDED_CHART_SENTINEL</chart>');
  assert.deepEqual(parseWorkbook(Buffer.from(zipSync(files))),parseWorkbook(source));
});
test('unknown non-empty source region fails loudly', () => {
  const bytes = change(sheet(2), xml => xml.replace('</x:sheetData>', '<x:row r="10"><x:c r="J10" t="str"><x:v>NEW NOTE</x:v></x:c></x:row></x:sheetData>'));
  assert.throws(() => parseWorkbook(bytes),/Unmapped non-empty source cells.*J10/);
});
test('missing required field fails', () => {
  assert.throws(() => parseWorkbook(change(sheet(1), xml => xml.replace(/<x:c r="G11"[^>]*>.*?<\/x:c>/,'').replace(/(<x:dimension[^>]*\/>)/,''))), /Missing required source value.*G11/);
});
test('unexpected header fails', () => assert.throws(() => parseWorkbook(change(sheet(1), x => x.replace('<x:v>Run</x:v>','<x:v>Workout</x:v>'))), /Header mismatch/));
test('unrecognized formula fails', () => assert.throws(() => parseWorkbook(change(sheet(2), x => x.replace('(B2+C2)/2','SUM(B2:C2)'))), /Unsupported formula/));
test('stale formula cache fails', () => assert.throws(() => parseWorkbook(change(sheet(2), x => x.replace(/(<x:c r="D2"[^>]*>.*?<x:v>)14.12/, '$199'))), /Stale formula cache/));
test('invalid dates fail', () => assert.throws(() => parseWorkbook(change(sheet(1), x => x.replace('46293','46293.5'))), /Expected Excel calendar date/));
test('deleted entire source record fails the reviewed contract', () => assert.throws(() => parseWorkbook(change(sheet(1), x => x.replace(/<x:row r="11"[^>]*>.*?<\/x:row>/,''))), /Reviewed record count changed/));
test('chart duplication is validated independently', () => assert.throws(() => parseWorkbook(change(sheet(2), x => x.replace(/(<x:c r="R2"[^>]*><x:v>)14.12/, '$199'))), /Roadmap\/chart discrepancy/));
test('unmapped chart meaning fails', () => assert.throws(() => parseWorkbook(change('xl/drawings/charts/chart1.xml', x => x.replace('<c:v>Mid</c:v>','<c:v>Other</c:v>'))), /Unrecognized chart series/));
test('line breaks and punctuation survive extraction', () => {
  const d = parseWorkbook(change(sheet(3),x => x.replace('Freshness is priority #1.','Freshness is priority #1.&#10;Original note; ~35–45%.')));
  assert.ok(String(d.guardrails.entries.find(e => e.title.value === 'Taper')!.text.value).endsWith('\nOriginal note; ~35–45%.'));
});
test('today and training summary are derived from source dates', () => {
  const d = parseWorkbook(source), s = deriveSummary(d.plan.entries,'2026-10-07');
  assert.equal(s.days,39); assert.equal(s.week,2); assert.equal(s.totalWeeks,7); assert.equal(s.phase,'Peak');
  assert.equal(s.next!.fields.Date.value,'2026-10-10'); assert.equal(s.current!.fields.Run.value,'REST');
  assert.equal(deriveSummary(d.plan.entries,'2026-11-15').days,0);
  assert.equal(deriveSummary(d.plan.entries,'2026-09-01').week,null);
  assert.equal(deriveSummary(d.plan.entries,'2026-12-01').phase,'Plan complete');
});
test('local date uses calendar components rather than UTC conversion', () => {
  const fake = { getFullYear: () => 2026, getMonth: () => 9, getDate: () => 7 } as Date;
  assert.equal(calendarDate(fake),'2026-10-07');
});
