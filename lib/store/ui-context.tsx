'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getThemeFromStorage, saveThemeToStorage, getEffectiveTheme, applyTheme, type Theme } from './theme'

interface UIContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: 'light' | 'dark'
}

const UIContext = createContext<UIContextType | undefined>(undefined)

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setThemeState] = useState<Theme>('system')
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    setMounted(true)
    const savedTheme = getThemeFromStorage()
    setThemeState(savedTheme)
    const effective = getEffectiveTheme(savedTheme)
    setEffectiveTheme(effective)
    applyTheme(effective)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const newEffective = mediaQuery.matches ? 'dark' : 'light'
      setEffectiveTheme(newEffective)
      applyTheme(newEffective)
    }

    handleChange()
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    saveThemeToStorage(newTheme)
    const effective = getEffectiveTheme(newTheme)
    setEffectiveTheme(effective)
    applyTheme(effective)
  }

  // Return default values during SSR/prerender to prevent hydration mismatch
  const contextValue: UIContextType = {
    sidebarOpen,
    setSidebarOpen,
    theme,
    setTheme,
    effectiveTheme,
  }

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within UIProvider')
  }
  return context
}
