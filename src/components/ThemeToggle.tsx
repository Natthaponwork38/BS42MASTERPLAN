import { useEffect, useLayoutEffect, useState } from 'react';

type Theme = 'light' | 'dark';
const systemTheme = (): Theme => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
function savedTheme(): Theme | null {
  try { const value = localStorage.getItem('bs42-theme'); return value === 'light' || value === 'dark' ? value : null; }
  catch { return null; }
}
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101110' : '#F7F7F5');
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => savedTheme() ?? systemTheme());
  const [manual, setManual] = useState(() => savedTheme() !== null);
  useLayoutEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const change = () => { if (!manual) setTheme(systemTheme()); };
    media.addEventListener('change', change);
    change();
    const storage = (event: StorageEvent) => {
      if (event.key !== 'bs42-theme' && event.key !== null) return;
      const saved = savedTheme(); setManual(saved !== null); setTheme(saved ?? systemTheme());
    };
    window.addEventListener('storage', storage);
    return () => { media.removeEventListener('change', change); window.removeEventListener('storage', storage); };
  }, [manual]);
  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setManual(true); applyTheme(next); setTheme(next);
    try { localStorage.setItem('bs42-theme', next); } catch { /* The control also works when storage is unavailable. */ }
  };
  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-pressed={theme === 'dark'}>
    <span className="theme-track" aria-hidden="true"><span className={`material-symbols-rounded ${theme === 'light' ? 'theme-selected' : ''}`}>light_mode</span><span className={`material-symbols-rounded ${theme === 'dark' ? 'theme-selected' : ''}`}>dark_mode</span></span>
  </button>;
}
