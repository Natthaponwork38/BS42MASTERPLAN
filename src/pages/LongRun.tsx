import { useState } from 'react';
import { roadmap } from '../lib/data';
import { formatDate, dateOf } from '../lib/dates';
import { SourceValue } from '../components/SourceValue';
import { LongRunChart } from '../components/LongRunChart';

export function LongRun() {
  const [selected, setSelected] = useState<number | null>(null);
  return <>
    <header className="page-header"><div><p className="eyebrow">Endurance</p><h1>Long Run</h1><p className="subtitle">The roadmap to Bangsaen42</p></div></header>
    <LongRunChart selected={selected} onSelect={setSelected} />
    <section aria-label="Full Long Run roadmap"><div className="section-heading"><h2>Long Run Roadmap</h2><span>{roadmap.entries.length} sessions</span></div>
      {roadmap.entries.map((entry,i) => {
        const f = entry.fields, min = Number(f['Target Min (km)'].value), max = Number(f['Target Max (km)'].value);
        const race = String(f.Role.value) === 'Race day';
        return <article key={entry.row} data-sheet="Long Run Roadmap" data-row={entry.row} className={`roadmap-entry ${race ? 'is-race' : ''} ${selected === i ? 'selected-entry' : ''}`}>
          <div className="roadmap-heading"><h3><span className="sr-only" data-source-cell={roadmap.headers.Date.address}>{String(roadmap.headers.Date.value)}: </span><time dateTime={dateOf(entry)} data-source-cell={f.Date.address} title={f.Date.display}>{formatDate(dateOf(entry), { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</time></h3><p>{min === max ? min : `${min}–${max}`}<span> km</span></p></div>
          <p className="role-label" data-source-cell={roadmap.headers.Role.address}>{String(roadmap.headers.Role.value)}</p><p className="role"><SourceValue cell={f.Role} /></p>
          <dl className="distance-fields">{['Target Min (km)','Target Max (km)','Planning Midpoint (km)'].map(label => <div key={label}><dt data-source-cell={roadmap.headers[label].address}>{label}</dt><dd><SourceValue cell={f[label]} /></dd></div>)}</dl>
          {f['Planning Midpoint (km)'].formula && <details className="formula-detail"><summary>Midpoint calculation</summary><p>{f['Planning Midpoint (km)'].formula} = {String(f['Planning Midpoint (km)'].value)}</p></details>}
        </article>;
      })}
    </section>
    <details className="chart-source"><summary>Chart source data <span>8 entries</span></summary><p className="muted">The separate chart data region from the workbook, retained in full.</p>
      {roadmap.chart.entries.map(e => <section key={e.row} className="chart-source-row" data-sheet="Long Run Roadmap" data-row={e.row}><h3><span className="sr-only" data-source-cell={roadmap.chart.headers.Date.address}>{String(roadmap.chart.headers.Date.value)}: </span><SourceValue cell={e.fields.Date} /></h3><dl>{['Min','Max','Mid'].map(label => <div key={label}><dt data-source-cell={roadmap.chart.headers[label].address}>{label}</dt><dd><SourceValue cell={e.fields[label]} /></dd></div>)}</dl></section>)}
      <details className="formula-detail"><summary>Chart series references</summary>{roadmap.series.map(s => <p key={s.name}>{s.name}<br />{s.categories}<br />{s.values}</p>)}</details>
    </details>
  </>;
}
