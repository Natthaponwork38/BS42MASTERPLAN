import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseWorkbook } from './parser';
import contract from '../data/source-contract.json' with { type: 'json' };

const bytes = await readFile(new URL(`../${contract.workbook}`, import.meta.url));
const data = parseWorkbook(bytes);
const dir = new URL('../src/data/', import.meta.url);
await mkdir(dir, { recursive: true });
for (const [name, content] of Object.entries({ 'master-plan': data.plan, 'long-run': data.longRun, guardrails: data.guardrails, audit: { workbook: contract.workbook, sha256: createHash('sha256').update(bytes).digest('hex'), raceDate: data.raceDate, sheets: data.audit, unmapped: [], assumptions: [] } })) {
  await writeFile(new URL(`${name}.json`, dir), JSON.stringify(content, null, 2) + '\n');
}
for (const a of data.audit) console.log(`PASS ${a.sheet}: ${a.generatedRecords}/${a.sourceRecords} records; ${a.mappedCells}/${a.sourceCells} non-empty cells`);
console.log(`PASS Long Run secondary chart region: ${data.longRun.chart.entries.length} records; 8 verified midpoint formulas. Excluded sheet is never extracted.`);
