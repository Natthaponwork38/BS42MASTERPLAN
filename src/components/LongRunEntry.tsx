import { roadmap, type SourceRow } from '../lib/data';
import { formatDate, dateOf } from '../lib/dates';
import { SourceValue } from './SourceValue';

export function LongRunEntry({ entry, selected = false, preview = false }: { entry: SourceRow; selected?: boolean; preview?: boolean }) {
  const f = entry.fields, min = Number(f['Target Min (km)'].value), max = Number(f['Target Max (km)'].value);
  const race = String(f.Role.value) === 'Race day';
  return <article aria-label={preview ? 'Selected Long Run session' : undefined} data-sheet="Long Run Roadmap" data-row={entry.row} className={`${preview ? 'roadmap-preview' : 'roadmap-entry'} ${race ? 'is-race' : ''} ${selected ? 'selected-entry' : ''}`}>
    <div className="roadmap-heading"><h3><span className="sr-only" data-source-cell={roadmap.headers.Date.address}>{String(roadmap.headers.Date.value)}: </span><time dateTime={dateOf(entry)} data-source-cell={f.Date.address} title={f.Date.display}>{formatDate(dateOf(entry), { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</time></h3><p>{min === max ? min : `${min}–${max}`}<span> km</span></p></div>
    <p className="midpoint">Midpoint <span>{String(f['Planning Midpoint (km)'].value)} km</span></p>
    <p className="role-label" data-source-cell={roadmap.headers.Role.address}>{String(roadmap.headers.Role.value)}</p><p className="role"><SourceValue cell={f.Role} /></p>
    <details className="source-values"><summary>Source values</summary>
      <dl className="distance-fields">{['Target Min (km)','Target Max (km)','Planning Midpoint (km)'].map(label => <div key={label}><dt data-source-cell={roadmap.headers[label].address}>{label}</dt><dd><SourceValue cell={f[label]} /></dd></div>)}</dl>
      {f['Planning Midpoint (km)'].formula && <p className="source-formula">Midpoint calculation<br />{f['Planning Midpoint (km)'].formula} = {String(f['Planning Midpoint (km)'].value)}</p>}
    </details>
  </article>;
}
