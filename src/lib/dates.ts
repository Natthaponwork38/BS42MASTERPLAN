import type { SourceRow } from './data';

// Calendar strings stay timezone-free. UTC is used only for arithmetic/formatting.
export const calendarDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const ordinal = (iso: string) => Date.parse(`${iso}T12:00:00Z`) / 86_400_000;
export const formatDate = (iso: string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }) => new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
export const dateOf = (row: SourceRow) => String(row.fields.Date.value);
export function deriveSummary(entries: SourceRow[], today: string) {
  const race = entries.find(e => e.fields.Phase.value === 'RACE')!;
  const first = dateOf(entries[0]), last = dateOf(entries.at(-1)!);
  const current = entries.find(e => dateOf(e) === today);
  const inPlan = today >= first && today <= last;
  const next = entries.find(e => dateOf(e) >= today && (/LONG RUN/.test(String(e.fields.Run.value)) || e.fields.Phase.value === 'RACE'));
  const nextLongRun = entries.find(e => dateOf(e) >= today && /LONG RUN/.test(String(e.fields.Run.value)));
  return { race, current, next, nextLongRun, days: Math.round(ordinal(dateOf(race)) - ordinal(today)),
    phase: current ? String(current.fields.Phase.value) : today < first ? 'Plan starts soon' : 'Plan complete',
    week: inPlan ? Math.floor((ordinal(today) - ordinal(first)) / 7) + 1 : null,
    totalWeeks: Math.ceil((ordinal(last) - ordinal(first) + 1) / 7) };
}
