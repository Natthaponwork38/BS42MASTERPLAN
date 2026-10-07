import { useState } from 'react';
import { plan } from '../lib/data';
import { dateOf, formatDate, deriveSummary } from '../lib/dates';
import { DayEntry } from '../components/DayEntry';
import { SourceValue } from '../components/SourceValue';

export function Plan({ today }: { today: string }) {
  const summary = deriveSummary(plan.entries, today);
  const earlier = plan.entries.filter(e => dateOf(e) < today);
  const upcoming = plan.entries.filter(e => dateOf(e) >= today);
  const [notice, setNotice] = useState('');
  const todayAction = () => {
    if (!summary.current) { setNotice(`Today is outside this plan (${formatDate(dateOf(plan.entries[0]))} – ${formatDate(dateOf(plan.entries.at(-1)!), { day: '2-digit', month: 'short', year: 'numeric' })}). All dates remain available below.`); return; }
    document.getElementById(`day-${today}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };
  return <>
    <header className="page-header"><div><p className="eyebrow">Training plan</p><h1>BS42</h1><p className="subtitle">Bangsaen Marathon 2026</p></div><button className="text-button" onClick={todayAction}>Today</button></header>
    <section className="training-summary" aria-label="Training summary">
      <div className="countdown"><strong>{Math.abs(summary.days)}</strong><span>{summary.days > 0 ? 'days to race' : summary.days === 0 ? 'Race day' : 'days since race'}</span></div>
      <div className="phase-summary"><strong>{summary.phase}</strong><span>{summary.week ? `Week ${summary.week} / ${summary.totalWeeks}` : `${summary.totalWeeks}-week plan`}</span></div>
      <p className="race-date">Race · {formatDate(dateOf(summary.race), { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </section>
    {summary.next && <section className="next-session" aria-label="Next key session"><p className="eyebrow">Next key session</p><p className="next-date">{formatDate(dateOf(summary.next), { weekday: 'short', day: '2-digit', month: 'short' })}</p><p className="next-run"><SourceValue cell={summary.next.fields.Run} /></p></section>}
    {summary.nextLongRun && summary.nextLongRun !== summary.next && <p className="muted">Next Long Run · {formatDate(dateOf(summary.nextLongRun))} · {String(summary.nextLongRun.fields.Run.value)}</p>}
    <p className="notice" role="status">{notice}</p>
    <section className="timeline" aria-label="Complete daily plan">
      <div className="section-heading"><h2>Daily plan</h2><span>{plan.entries.length} days</span></div>
      {earlier.length > 0 && <details className="earlier-days" open={upcoming.length === 0}><summary><span>Earlier days</span><span>{formatDate(dateOf(earlier[0]))} – {formatDate(dateOf(earlier.at(-1)!))}<small>{earlier.length} days</small></span></summary>{earlier.map(entry => <DayEntry key={dateOf(entry)} entry={entry} headers={plan.headers} today={today} />)}</details>}
      {upcoming.map((entry, index) => <div key={dateOf(entry)}>
        {(index === 0 || dateOf(entry).slice(0,7) !== dateOf(upcoming[index-1]).slice(0,7)) && <h2 className="month-heading">{formatDate(dateOf(entry), { month: 'long', year: 'numeric' })}</h2>}
        <DayEntry entry={entry} headers={plan.headers} today={today} />
      </div>)}
    </section>
  </>;
}
