import type { SourceRow } from './data';

// Calendar strings stay timezone-free. UTC is used only for arithmetic/formatting.
export const calendarDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const ordinal = (iso: string) => Date.parse(`${iso}T12:00:00Z`) / 86_400_000;
export const formatDate = (iso: string, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }) => new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));
export const dateOf = (row: SourceRow) => String(row.fields.Date.value);
export function isKeySession(row: SourceRow) {
  const run = String(row.fields.Run.value);
  if (row.fields.Phase.value === 'RACE' || /\bLONG RUN\b/i.test(run)) return true;
  // Only explicitly prescribed workout types qualify. Optional touches and
  // negative mentions do not turn an easy/recovery day into a key session.
  if (/\b(?:optional|if fresh|if recovered|if feeling)\b/i.test(run)) return false;
  const quality = /\b(?:MP|marathon[ -]pace|threshold|tempo)\b/ig;
  return [...run.matchAll(quality)].some(match => !/\b(?:no|not|skip|avoid|without)(?:\s+\w+){0,2}\s*$/i.test(run.slice(0,match.index)));
}
export function trainingWeeks(entries: SourceRow[]) {
  return Array.from({ length: Math.ceil(entries.length / 7) }, (_, index) => {
    const days = entries.slice(index * 7, index * 7 + 7);
    const phases = [...new Set(days.map(e => String(e.fields.Phase.value)))];
    return { number: index + 1, days, phases };
  });
}
export function deriveSummary(entries: SourceRow[], today: string) {
  const race = entries.find(e => e.fields.Phase.value === 'RACE')!;
  const first = dateOf(entries[0]), last = dateOf(entries.at(-1)!);
  const current = entries.find(e => dateOf(e) === today);
  const inPlan = today >= first && today <= last;
  const next = entries.find(e => dateOf(e) >= today && isKeySession(e) && !String(e.fields['Status / Note'].value).startsWith('Completed'));
  const nextLongRun = entries.find(e => dateOf(e) >= today && /LONG RUN/.test(String(e.fields.Run.value)));
  return { race, current, next, nextLongRun, days: Math.round(ordinal(dateOf(race)) - ordinal(today)),
    phase: current ? String(current.fields.Phase.value) : today < first ? 'Plan starts soon' : 'Plan complete',
    week: inPlan ? Math.floor((ordinal(today) - ordinal(first)) / 7) + 1 : null,
    totalWeeks: Math.ceil((ordinal(last) - ordinal(first) + 1) / 7) };
}
