import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { ThemeMode } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { ThemeContext, type ResolvedTheme, type ThemeContextValue } from './ThemeContext';

const STORAGE_KEY = STORAGE_KEYS.theme;

function readStoredMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'system';
    const parsed = JSON.parse(raw) as ThemeMode | { version?: number; data?: ThemeMode };
    if (typeof parsed === 'string') return parsed;
    if (parsed && typeof parsed === 'object' && 'data' in parsed && parsed.data) {
      return parsed.data as ThemeMode;
    }
  } catch {
    // ignore
  }
  return 'system';
}

function writeStoredMode(mode: ThemeMode) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mode));
}

function resolveMode(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode());
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveMode(readStoredMode()));

  useEffect(() => {
    const next = resolveMode(mode);
    setResolved(next);
    applyResolvedTheme(next);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next: ResolvedTheme = mq.matches ? 'dark' : 'light';
      setResolved(next);
      applyResolvedTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    writeStoredMode(next);
    setModeState(next);
  }, []);

  const value: ThemeContextValue = { mode, resolved, setMode };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
