import { useState } from 'react';
import { roadmap } from '../lib/data';
import { SourceValue } from '../components/SourceValue';
import { LongRunChart } from '../components/LongRunChart';
import { LongRunEntry } from '../components/LongRunEntry';

export function LongRun() {
  const [selected, setSelected] = useState<number | null>(null);
  return <>
    <header className="page-header"><div><p className="eyebrow">Endurance</p><h1>Long Run</h1><p className="subtitle">The roadmap to Bangsaen42</p></div></header>
    <LongRunChart selected={selected} onSelect={setSelected}>
      {selected !== null && <LongRunEntry key={roadmap.entries[selected].row} entry={roadmap.entries[selected]} selected preview />}
    </LongRunChart>
    <section aria-label="Full Long Run roadmap"><div className="section-heading"><h2>Long Run Roadmap</h2><span>{roadmap.entries.length} sessions</span></div>
      {roadmap.entries.map((entry,i) => <LongRunEntry key={entry.row} entry={entry} selected={selected === i} />)}
    </section>
    <details className="chart-source"><summary>Chart source data <span>8 entries</span></summary><p className="muted">The separate chart data region from the workbook, retained in full.</p>
      {roadmap.chart.entries.map(e => <section key={e.row} className="chart-source-row" data-sheet="Long Run Roadmap" data-row={e.row}><h3><span className="sr-only" data-source-cell={roadmap.chart.headers.Date.address}>{String(roadmap.chart.headers.Date.value)}: </span><SourceValue cell={e.fields.Date} /></h3><dl>{['Min','Max','Mid'].map(label => <div key={label}><dt data-source-cell={roadmap.chart.headers[label].address}>{label}</dt><dd><SourceValue cell={e.fields[label]} /></dd></div>)}</dl></section>)}
      <details className="formula-detail"><summary>Chart series references</summary>{roadmap.series.map(s => <p key={s.name}>{s.name}<br />{s.categories}<br />{s.values}</p>)}</details>
    </details>
  </>;
}
