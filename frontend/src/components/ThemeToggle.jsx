// src/components/ThemeToggle.jsx
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setDark((v) => !v)}
      className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 border border-black/5 dark:border-white/10
                 hover:shadow-lg transition"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? '🌙' : '☀️'}
      <span className="text-sm font-medium">{dark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
