export type Destination = 'plan' | 'long-run' | 'guardrails';
export const destinations = [
  { id: 'plan', label: 'Plan', icon: 'calendar_month' },
  { id: 'long-run', label: 'Long Run', icon: 'route' },
  { id: 'guardrails', label: 'Guardrails', icon: 'rule' },
] as const;
export function BottomNav({ active }: { active: Destination }) {
  return <nav className="bottom-nav" aria-label="Primary navigation"><div>{destinations.map(d => <a key={d.id} href={`#/${d.id}`} aria-current={active === d.id ? 'page' : undefined} onClick={event => {
    if (d.id !== 'plan' || active !== 'plan' || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }}>
    <span className="material-symbols-rounded" aria-hidden="true">{d.icon}</span><span>{d.label}</span>
  </a>)}</div></nav>;
}
