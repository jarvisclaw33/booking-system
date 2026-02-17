'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useUI } from '@/lib/store/ui-context'
import { Button } from '@/components/ui/button'

interface ThemeToggleProps {
  label?: string
  variant?: 'icon' | 'full'
}

const options = [
  { value: 'light', label: 'Hell', icon: Sun },
  { value: 'dark', label: 'Dunkel', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export function ThemeToggle({ label = 'Design', variant = 'icon' }: ThemeToggleProps) {
  const { theme, setTheme, effectiveTheme } = useUI()

  if (variant === 'full') {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
        <div className="flex items-center gap-2">
          {options.map(option => {
            const Icon = option.icon
            const isActive = theme === option.value
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/20 dark:text-blue-200'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Aktuell: {effectiveTheme === 'dark' ? 'Dunkel' : 'Hell'}
        </p>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(effectiveTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Dark Mode umschalten"
      className="text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
    >
      {effectiveTheme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  )
}
