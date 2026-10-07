import { useEffect, useRef, useState } from 'react';
import { BottomNav, destinations, type Destination } from './components/BottomNav';
import { Plan } from './pages/Plan';
import { LongRun } from './pages/LongRun';
import { Guardrails } from './pages/Guardrails';
import { calendarDate } from './lib/dates';
import { ThemeToggle } from './components/ThemeToggle';

const getDestination = (): Destination => destinations.find(d => window.location.hash === `#/${d.id}`)?.id ?? 'plan';
export default function App() {
  const [active, setActive] = useState<Destination>(getDestination);
  const [today, setToday] = useState(calendarDate);
  const firstRender = useRef(true);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const navigate = () => setActive(getDestination());
    const updateDate = () => setToday(calendarDate());
    window.addEventListener('hashchange', navigate);
    window.addEventListener('focus', updateDate);
    document.addEventListener('visibilitychange', updateDate);
    const timer = window.setInterval(updateDate, 30_000);
    return () => { window.removeEventListener('hashchange', navigate); window.removeEventListener('focus', updateDate); document.removeEventListener('visibilitychange', updateDate); clearInterval(timer); };
  }, []);
  useEffect(() => {
    document.title = `BS42 · ${destinations.find(d => d.id === active)!.label}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!firstRender.current) main.current?.focus({ preventScroll: true });
    firstRender.current = false;
  }, [active]);
  return <><a href="#main" className="skip-link">Skip to content</a><div className="app-header"><ThemeToggle /></div><main id="main" ref={main} tabIndex={-1} key={active}>
    {active === 'plan' ? <Plan today={today} /> : active === 'long-run' ? <LongRun /> : <Guardrails />}
  </main><BottomNav active={active} /></>;
}
