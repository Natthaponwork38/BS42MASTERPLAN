import { rules } from '../lib/data';
import { SourceValue } from '../components/SourceValue';

const lineBreaks: Record<string, RegExp> = {
  'Weekly baseline': /(\s+\|\s+)/g,
  'Strength split': /(\s+\|\s+|;\s+)/g,
  'Priority order': /(\s+(?=[2-4]\)))/g,
  'Pace guide': /(\s+\|\s+|(?<=\.)\s+(?=Garmin\b))/g,
};

export function Guardrails() {
  return <>
    <header className="page-header"><div><p className="eyebrow">The reference</p><h1>Guardrails</h1><p className="subtitle" data-source-cell={rules.title.address}>{String(rules.title.value)}</p></div></header>
    <div className="guardrails" data-sheet="Guardrails">{rules.entries.map(entry => <section key={entry.row} data-row={entry.row}><h2><SourceValue cell={entry.title} /></h2><p><SourceValue cell={entry.text} emphasize={['Goal','Pace guide'].includes(String(entry.title.value)) ? 'pace' : undefined} lineBreaks={lineBreaks[String(entry.title.value)]} /></p></section>)}</div>
  </>;
}
