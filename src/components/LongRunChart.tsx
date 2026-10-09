import type { ReactNode } from 'react';
import { roadmap } from '../lib/data';

export function LongRunChart({ selected, onSelect, children }: { selected: number | null; onSelect: (i: number) => void; children?: ReactNode }) {
  const entries = roadmap.chart.entries;
  const x = (i: number) => 33 + i * 45;
  const y = (v: number) => 199 - v / 45 * 164;
  const line = (field: string) => entries.map((e,i) => `${x(i)},${y(Number(e.fields[field].value))}`).join(' ');
  return <figure className="progression">
    <figcaption>{roadmap.chartTitle}</figcaption>
    <svg viewBox="0 0 382 246" role="img" aria-labelledby="chart-title chart-description">
      <title id="chart-title">{roadmap.chartTitle}</title><desc id="chart-description">Distance in kilometres. Min, Max and Mid lines show all eight source entries, including race day. The complete values and roles follow below.</desc>
      {[0,15,30,45].map(v => <g key={v}><line x1="33" x2="359" y1={y(v)} y2={y(v)} className="chart-grid" /><text x="23" y={y(v)+4} textAnchor="end">{v}</text></g>)}
      <text x="6" y="17">km</text>
      <polyline points={line('Min')} className="chart-min" /><polyline points={line('Max')} className="chart-max" /><polyline points={line('Mid')} className="chart-mid" />
      {entries.map((entry,i) => { const [day,month] = String(entry.fields.Date.value).split(' '); return <g key={entry.row}>
        <circle cx={x(i)} cy={y(Number(entry.fields.Mid.value))} r={selected === i ? 5 : 3} className={selected === i ? 'chart-selected' : 'chart-point'} />
        <text x={x(i)} y="218" textAnchor="middle">{day}</text><text x={x(i)} y="233" textAnchor="middle">{month}</text>
      </g>; })}
    </svg>
    <div className="chart-legend"><span className="legend-min">Min</span><span className="legend-max">Max</span><span className="legend-mid">Midpoint</span></div>
    <div className="chart-select" aria-label="Inspect chart date">{entries.map((e,i) => <button key={e.row} onClick={() => onSelect(i)} aria-pressed={selected === i} aria-label={`Inspect ${String(e.fields.Date.value)}`}>{String(e.fields.Date.value)}</button>)}</div>
    {selected !== null && <p className="chart-reading" role="status">{String(entries[selected].fields.Date.value)} · Min {String(entries[selected].fields.Min.value)} · Max {String(entries[selected].fields.Max.value)} · Mid {String(entries[selected].fields.Mid.value)} km</p>}
    {children}
  </figure>;
}
