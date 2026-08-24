import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

// ─── Quick Toggle Button (for Navbar header) ─────────────────────────────────

export const ThemeQuickToggle: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={resolvedTheme === 'dark' ? 'Switch to Light mode' : 'Switch to Night Vision'}
      title={resolvedTheme === 'dark' ? 'Light mode' : 'Night Vision'}
      className="theme-quick-toggle"
    >
      {resolvedTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
};

// ─── Full Segmented Appearance Control (for Profile pages) ───────────────────

const MODES: { value: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: <Sun size={16} />,
    description: 'Standard light interface',
  },
  {
    value: 'dark',
    label: 'Night Vision',
    icon: <Moon size={16} />,
    description: 'Dark, low-glare healthcare interface',
  },
  {
    value: 'system',
    label: 'System',
    icon: <Monitor size={16} />,
    description: 'Follow OS preference',
  },
];

export const AppearanceControl: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="appearance-control">
      <div className="appearance-label">Appearance</div>
      <div className="appearance-segments">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            onClick={() => setTheme(mode.value)}
            className={`appearance-segment ${theme === mode.value ? 'is-active' : ''}`}
            aria-pressed={theme === mode.value}
            title={mode.description}
          >
            {mode.icon}
            <span>{mode.label}</span>
          </button>
        ))}
      </div>
      <p className="appearance-hint">
        {MODES.find((m) => m.value === theme)?.description}
      </p>
    </div>
  );
};

// ─── Dropdown Appearance Picker (for Navbar desktop dropdown) ────────────────

export const AppearanceDropdown: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="appearance-dropdown-root" ref={ref}>
      <button
        className="theme-quick-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label="Appearance settings"
        title="Appearance"
      >
        {resolvedTheme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
      </button>

      {open && (
        <div className="appearance-dropdown-panel" role="menu">
          <div className="appearance-dropdown-header">Appearance</div>
          {MODES.map((mode) => (
            <button
              key={mode.value}
              className={`appearance-dropdown-item ${theme === mode.value ? 'is-active' : ''}`}
              onClick={() => { setTheme(mode.value); setOpen(false); }}
              role="menuitem"
            >
              <span className="appearance-dropdown-icon">{mode.icon}</span>
              <span>{mode.label}</span>
              {theme === mode.value && <span className="appearance-dropdown-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeQuickToggle;
