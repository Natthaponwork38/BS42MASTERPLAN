import { useState } from 'react';
import { plan } from '../lib/data';
import { dateOf, formatDate, deriveSummary, trainingWeeks } from '../lib/dates';
import { DayEntry } from '../components/DayEntry';
import { SourceValue } from '../components/SourceValue';

export function Plan({ today }: { today: string }) {
  const summary = deriveSummary(plan.entries, today);
  const weeks = trainingWeeks(plan.entries);
  const [notice, setNotice] = useState('');
  const todayAction = () => {
    if (!summary.current) { setNotice(`Today is outside this plan (${formatDate(dateOf(plan.entries[0]))} – ${formatDate(dateOf(plan.entries.at(-1)!), { day: '2-digit', month: 'short', year: 'numeric' })}). All dates remain available below.`); return; }
    document.getElementById(`day-${today}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };
  return <>
    <header className="page-header"><div><p className="eyebrow">Training plan</p><h1>BS42</h1><p className="subtitle">Bangsaen Marathon 2026</p></div></header>
    <section className="training-summary" aria-label="Training summary">
      <div className="countdown"><strong>{Math.abs(summary.days)}</strong><span>{summary.days > 0 ? 'days to race' : summary.days === 0 ? 'Race day' : 'days since race'}</span></div>
      <div className="phase-summary"><strong>{summary.phase}</strong><span>{summary.week ? `Week ${summary.week} / ${summary.totalWeeks}` : `${summary.totalWeeks}-week plan`}</span></div>
      <p className="race-date">Race · {formatDate(dateOf(summary.race), { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    </section>
    <section className="today-focus" aria-label="Today's workout"><div className="focus-heading"><p className="eyebrow today-label">Today</p><button className="today-button" onClick={todayAction} aria-label="Today">View day</button></div>
      {summary.current ? <><p className="next-date">{formatDate(today, { weekday: 'short', day: '2-digit', month: 'short' })}</p><p className="today-run"><SourceValue cell={summary.current.fields.Run} /></p></> : <p className="muted">{today < dateOf(plan.entries[0]) ? 'The plan has not started yet.' : 'The plan is complete.'} All dates remain below.</p>}
    </section>
    {summary.next && <section className="next-session" aria-label="Next key session"><p className="eyebrow">Next key session</p><p className="next-date">{formatDate(dateOf(summary.next), { weekday: 'short', day: '2-digit', month: 'short' })}</p><p className="next-run"><SourceValue cell={summary.next.fields.Run} emphasize={/LONG RUN/.test(String(summary.next.fields.Run.value)) || summary.next.fields.Phase.value === 'RACE' ? 'distance' : 'pace'} /></p></section>}
    {summary.nextLongRun && summary.nextLongRun !== summary.next && <p className="muted">Next Long Run · {formatDate(dateOf(summary.nextLongRun))} · {String(summary.nextLongRun.fields.Run.value)}</p>}
    <p className="notice" role="status">{notice}</p>
    <section className="timeline" aria-label="Complete daily plan">
      <div className="section-heading"><h2>Daily plan</h2><span>{plan.entries.length} days</span></div>
      {weeks.map(week => <section className={`training-week ${week.number === summary.week ? 'current-week' : ''}`} key={week.number} aria-labelledby={`week-${week.number}`}>
        <div className="week-heading"><h3 id={`week-${week.number}`}>Week {week.number} · {week.phases.join(' / ')}</h3><p>{formatDate(dateOf(week.days[0]))} – {formatDate(dateOf(week.days.at(-1)!), { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
        {week.days.map(entry => <DayEntry key={dateOf(entry)} entry={entry} headers={plan.headers} today={today} />)}
      </section>)}
    </section>
  </>;
}
