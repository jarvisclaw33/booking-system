// @ts-nocheck
'use client'

export type Theme = 'light' | 'dark' | 'system'

export interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: 'light' | 'dark'
}

export const THEME_STORAGE_KEY = 'booking-system-theme'

export function getThemeFromStorage(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  return (stored as Theme) || 'system'
}

export function saveThemeToStorage(theme: Theme): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  if (theme === 'dark') {
    html.classList.add('dark')
    html.style.colorScheme = 'dark'
  } else {
    html.classList.remove('dark')
    html.style.colorScheme = 'light'
  }
}
