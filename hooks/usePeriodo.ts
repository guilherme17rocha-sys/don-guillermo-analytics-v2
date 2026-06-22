'use client'

import { useContext } from 'react'
import { PeriodoContext } from '@/contexts/PeriodoContext'

export function usePeriodo() {
  const ctx = useContext(PeriodoContext)
  if (!ctx) throw new Error('usePeriodo must be used within PeriodoProvider')
  return ctx
}
