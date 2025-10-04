'use client'

import { createContext, useContext, ReactNode } from 'react'
import { AllSettings } from '@/types/settings.types'

interface SettingsContextType {
  settings: AllSettings
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

interface SettingsProviderProps {
  children: ReactNode
  settings: AllSettings
}

export function SettingsProvider({ children, settings }: SettingsProviderProps) {
  return (
    <SettingsContext.Provider value={{ settings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

