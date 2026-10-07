import type { SourceRow, Fields } from '../../scripts/parser';
import { formatDate, dateOf } from '../lib/dates';
import { SourceValue } from './SourceValue';

export function DayEntry({ entry, headers, today }: { entry: SourceRow; headers: Fields; today: string }) {
  const f = entry.fields, iso = dateOf(entry);
  const isToday = iso === today, race = f.Phase.value === 'RACE';
  const completed = String(f['Status / Note'].value).startsWith('Completed');
  const longRun = /LONG RUN/.test(String(f.Run.value));
  return <article id={`day-${iso}`} className={`day-entry ${isToday ? 'is-today' : ''} ${race ? 'is-race' : ''}`} data-sheet="BS42 Master Plan" data-row={entry.row} aria-label={`${iso}${isToday ? ', today' : ''}`}>
    <div className="day-heading">
      <h4><span className="sr-only" data-source-cell={headers.Date.address}>{String(headers.Date.value)}: </span><time dateTime={iso} data-source-cell={f.Date.address} title={f.Date.display}><span className="sr-only" data-source-cell={headers.Day.address}>{String(headers.Day.value)}: </span><span data-source-cell={f.Day.address}>{String(f.Day.value)}</span> {formatDate(iso, { day: '2-digit', month: 'short', year: 'numeric' })}</time></h4>
      {isToday && <span className="today-tag">Today</span>}
    </div>
    <div className="day-context"><span className="sr-only" data-source-cell={headers.Phase.address}>{String(headers.Phase.value)}: </span><SourceValue cell={f.Phase} />{completed && <span className="completed">Completed</span>}{longRun && <span className="key-label">Long Run</span>}</div>
    <dl className="day-fields">
      {['Run', 'Strength', 'Priority / Purpose', 'Status / Note'].map(label => <div key={label} className={label === 'Run' ? 'run-field' : ''}>
        <dt data-source-cell={headers[label].address}>{String(headers[label].value)}</dt>
        <dd><SourceValue cell={f[label]} /></dd>
      </div>)}
    </dl>
  </article>;
}
