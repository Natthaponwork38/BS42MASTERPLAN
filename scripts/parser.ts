import * as XLSX from 'xlsx';
import { unzipSync, strFromU8 } from 'fflate';
import { XMLParser } from 'fast-xml-parser';
import { posix } from 'node:path';
import contract from '../data/source-contract.json' with { type: 'json' };

export type Cell = { address: string; value: string | number; raw: string | number; display: string; format: string; formula?: string; cached?: number };
export type Fields = Record<string, Cell>;
export type SourceRow = { row: number; fields: Fields };
export type Table = { sheet: string; headers: Fields; entries: SourceRow[] };
export const INCLUDED = ['BS42 Master Plan', 'Long Run Roadmap', 'Guardrails'] as const;
export const PLAN_HEADERS = ['Date', 'Day', 'Phase', 'Run', 'Strength', 'Priority / Purpose', 'Status / Note'];
export const LR_HEADERS = ['Date', 'Target Min (km)', 'Target Max (km)', 'Planning Midpoint (km)', 'Role'];
export const CHART_HEADERS = ['Date', 'Min', 'Max', 'Mid'];
export function requireThat(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const meaningful = (c: XLSX.CellObject) => c.v !== undefined && c.v !== null && c.v !== '' || !!c.f;

export function parseWorkbook(bytes: Buffer, enforceContract = true) {
  const book = XLSX.read(bytes, { type: 'buffer', sheets: [...INCLUDED], cellDates: false, cellNF: true, cellFormula: true });
  for (const name of INCLUDED) requireThat(book.SheetNames.includes(name), `Missing required sheet: ${name}`);
  const claimed = new Map<string, Set<string>>();
  const inventory = new Map<string, string[]>();
  for (const name of INCLUDED) {
    const sheet = book.Sheets[name];
    requireThat(!sheet['!autofilter'] || !sheet['!autofilter'].ref.includes('!'), `Unexpected filter in ${name}`);
    const cells = Object.keys(sheet).filter(a => !a.startsWith('!') && meaningful(sheet[a]));
    inventory.set(name, cells);
    claimed.set(name, new Set());
    for (const a of Object.keys(sheet).filter(a => !a.startsWith('!'))) {
      const c = sheet[a];
      requireThat(!c.c?.length && !c.l, `Unmapped annotation or hyperlink: ${name}!${a}`);
      requireThat(c.t !== 'e', `Excel error: ${name}!${a}`);
      requireThat(!c.F, `Unsupported array formula: ${name}!${a}`);
      if (typeof c.v === 'string') requireThat(!/\p{Extended_Pictographic}/u.test(c.v), `Source emoji requires review: ${name}!${a}`);
    }
  }
  function take(name: string, address: string, kind: 'text' | 'date' | 'number' = 'text'): Cell {
    const c = book.Sheets[name][address];
    requireThat(c && meaningful(c), `Missing required source value: ${name}!${address}`);
    requireThat(!claimed.get(name)!.has(address), `Duplicate mapping: ${name}!${address}`);
    claimed.get(name)!.add(address);
    let value: string | number = c.v;
    const result: Cell = { address, value, raw: c.v ?? '', display: c.w ?? String(c.v ?? ''), format: c.z ?? 'General' };
    if (c.f) {
      const row = XLSX.utils.decode_cell(address).r + 1;
      requireThat(name === 'Long Run Roadmap' && address === `D${row}` && c.f === `(B${row}+C${row})/2`, `Unsupported formula: ${name}!${address} =${c.f}`);
      const min = book.Sheets[name][`B${row}`]?.v, max = book.Sheets[name][`C${row}`]?.v;
      requireThat(typeof min === 'number' && typeof max === 'number', `Invalid formula inputs: ${name}!${address}`);
      value = (min + max) / 2;
      requireThat(c.v === undefined || Math.abs(c.v - value) < 1e-9, `Stale formula cache: ${name}!${address}`);
      result.formula = `=${c.f}`;
      if (typeof c.v === 'number') result.cached = c.v;
      result.display = XLSX.SSF.format(c.z ?? 'General', value);
    }
    if (kind === 'date') {
      requireThat(typeof value === 'number' && Number.isInteger(value), `Expected Excel calendar date: ${name}!${address}`);
      const d = XLSX.SSF.parse_date_code(value, { date1904: !!book.Workbook?.WBProps?.date1904 });
      requireThat(d && d.y >= 2000 && d.y <= 2100 && d.H === 0 && d.M === 0 && d.S === 0, `Invalid date: ${name}!${address}`);
      value = `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    } else if (kind === 'number') requireThat(typeof value === 'number' && Number.isFinite(value), `Expected number: ${name}!${address}`);
    else requireThat(typeof value === 'string', `Expected text: ${name}!${address}`);
    result.value = value;
    return result;
  }
  function table(name: string, labels: string[], startColumn: number, dateIsText = false): Table {
    const sheet = book.Sheets[name];
    const headers: Fields = {};
    labels.forEach((label, i) => {
      const address = XLSX.utils.encode_cell({ r: 0, c: startColumn + i });
      requireThat(sheet[address]?.v === label, `Header mismatch: ${name}!${address}; expected ${label}`);
      headers[label] = take(name, address);
    });
    const rows = new Set(inventory.get(name)!.map(a => XLSX.utils.decode_cell(a)).filter(p => p.r > 0 && p.c >= startColumn && p.c < startColumn + labels.length).map(p => p.r));
    const entries = [...rows].sort((a, b) => a - b).map(r => ({ row: r + 1, fields: Object.fromEntries(labels.map((label, i) => [label, take(name, XLSX.utils.encode_cell({ r, c: startColumn + i }), label === 'Date' ? dateIsText ? 'text' : 'date' : /^(Target |Planning |Min$|Max$|Mid$)/.test(label) ? 'number' : 'text')])) }));
    if (!dateIsText) for (let i = 1; i < entries.length; i++) requireThat(entries[i].fields.Date.value > entries[i - 1].fields.Date.value, `Dates must be unique and chronological: ${name}`);
    return { sheet: name, headers, entries };
  }
  // Regions verified against the supplied workbook. New regions fail the coverage check.
  const plan = table(INCLUDED[0], PLAN_HEADERS, 0);
  const roadmap = table(INCLUDED[1], LR_HEADERS, 0);
  const chart = table(INCLUDED[1], CHART_HEADERS, 16, true);
  const guardTitle = take(INCLUDED[2], 'A1');
  const guardSheet = book.Sheets[INCLUDED[2]];
  requireThat((guardSheet['!merges'] ?? []).length === 1 && XLSX.utils.encode_range(guardSheet['!merges']![0]) === 'A1:B1', 'Unexpected Guardrails merged regions');
  for (const name of INCLUDED.slice(0, 2)) requireThat(!book.Sheets[name]['!merges']?.length, `Unexpected merged source cells: ${name}`);
  const guardRows = [...new Set(inventory.get(INCLUDED[2])!.map(a => XLSX.utils.decode_cell(a).r).filter(r => r > 0))].sort((a,b) => a-b);
  const guardrails = { sheet: INCLUDED[2], title: guardTitle, entries: guardRows.map(r => ({ row: r + 1, title: take(INCLUDED[2], `A${r + 1}`), text: take(INCLUDED[2], `B${r + 1}`) })) };
  for (const entry of plan.entries) {
    const iso = String(entry.fields.Date.value);
    const day = new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
    requireThat(day === entry.fields.Day.value, `Day/date mismatch: ${iso}`);
  }
  const races = plan.entries.filter(e => e.fields.Phase.value === 'RACE');
  requireThat(races.length === 1, 'Expected one explicit RACE phase');
  requireThat(chart.entries.length === roadmap.entries.length, 'Roadmap/chart row counts differ');
  roadmap.entries.forEach((entry, i) => {
    const values = entry.fields;
    requireThat(Number(values['Target Min (km)'].value) <= Number(values['Target Max (km)'].value), `Invalid long run range at row ${entry.row}`);
    const iso = String(values.Date.value);
    const label = `${iso.slice(8)} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(iso.slice(5,7))-1]}`;
    requireThat(chart.entries[i].fields.Date.value === label, `Ambiguous chart date at row ${entry.row}`);
    for (const [a,b] of [['Target Min (km)','Min'],['Target Max (km)','Max'],['Planning Midpoint (km)','Mid']]) requireThat(values[a].value === chart.entries[i].fields[b].value, `Roadmap/chart discrepancy at row ${entry.row}: ${a}`);
  });
  // Retain the chart's own title, series names and cell bindings as source content.
  const zip = unzipSync(bytes);
  const reader = new XMLParser({ removeNSPrefix: true, ignoreAttributes: false, attributeNamePrefix: '' });
  const readXml = (path: string) => { requireThat(zip[path], `Missing workbook part: ${path}`); return reader.parse(strFromU8(zip[path])); };
  const array = <T,>(value: T | T[] | undefined): T[] => value === undefined ? [] : Array.isArray(value) ? value : [value];
  type Relationship = { Id: string; Target: string; Type: string; TargetMode?: string };
  function relationships(part: string): Relationship[] {
    const path = posix.join(posix.dirname(part), '_rels', posix.basename(part) + '.rels');
    return zip[path] ? array(readXml(path).Relationships.Relationship) : [];
  }
  function follow(part: string, id: string) {
    const rel = relationships(part).find(r => r.Id === id);
    requireThat(rel && rel.TargetMode !== 'External', `Unmapped external/missing relation: ${part} ${id}`);
    return rel.Target.startsWith('/') ? rel.Target.slice(1) : posix.normalize(posix.join(posix.dirname(part),rel.Target));
  }
  // Traverse only drawings attached to included sheets; excluded-sheet charts are ignored.
  const sheetNodes = array<{name:string;id:string}>(readXml('xl/workbook.xml').workbook.sheets.sheet);
  let chartPath = '';
  for (const name of INCLUDED) {
    const part = follow('xl/workbook.xml',sheetNodes.find(s => s.name === name)!.id);
    const sheetXml = readXml(part).worksheet;
    const drawings = array<{id:string}>(sheetXml.drawing);
    requireThat(!sheetXml.legacyDrawing && !sheetXml.picture && !sheetXml.oleObjects, `Unmapped source object: ${name}`);
    requireThat(drawings.length === (name === 'Long Run Roadmap' ? 1 : 0), `Unexpected source drawings: ${name}`);
    if (drawings.length) {
      const drawingPart = follow(part,drawings[0].id);
      const drawing = readXml(drawingPart).wsDr;
      const anchors = array(drawing.twoCellAnchor);
      requireThat(anchors.length === 1 && !drawing.oneCellAnchor && !drawing.absoluteAnchor && !anchors[0].sp && !anchors[0].pic, `Unmapped drawing objects: ${name}`);
      const id = anchors[0].graphicFrame?.graphic?.graphicData?.chart?.id;
      requireThat(typeof id === 'string', `Unmapped chart drawing: ${name}`);
      chartPath = follow(drawingPart,id);
    }
  }
  requireThat(chartPath, 'Missing Long Run source chart');
  const xml = readXml(chartPath);
  const sourceChart = xml.chartSpace.chart;
  const chartTitle = sourceChart.title.tx.rich.p.r.t;
  requireThat(typeof chartTitle === 'string', 'Unsupported chart title structure');
  const series = sourceChart.plotArea.lineChart.ser.map((s: {tx:{v:string};cat:{strRef:{f:string}};val:{numRef:{f:string}}}) => ({ name: s.tx.v, categories: s.cat.strRef.f, values: s.val.numRef.f }));
  requireThat(series.length === 3 && series.every((s: {name:string;categories:string;values:string},i:number) => s.name === CHART_HEADERS[i+1] && s.categories === "'Long Run Roadmap'!$Q$2:$Q$9" && s.values === `'Long Run Roadmap'!$${['R','S','T'][i]}$2:$${['R','S','T'][i]}$9`), 'Unrecognized chart series or bindings');
  const audit = INCLUDED.map(name => {
    const missing = inventory.get(name)!.filter(a => !claimed.get(name)!.has(a));
    requireThat(missing.length === 0, `Unmapped non-empty source cells in ${name}: ${missing.join(', ')}`);
    const records = name === INCLUDED[0] ? plan.entries.length : name === INCLUDED[1] ? roadmap.entries.length : guardrails.entries.length;
    if (enforceContract) {
      requireThat(records === contract.sheets[name].records, `Reviewed record count changed: ${name}; review data/source-contract.json`);
      requireThat(inventory.get(name)!.length === contract.sheets[name].nonEmptyCells, `Reviewed cell count changed: ${name}; review data/source-contract.json`);
    }
    return { sheet: name, sourceRecords: records, generatedRecords: records, sourceCells: inventory.get(name)!.length, mappedCells: claimed.get(name)!.size, unmappedCells: missing };
  });
  return { plan, longRun: { ...roadmap, chart, chartTitle, series }, guardrails, audit, raceDate: String(races[0].fields.Date.value) };
}
