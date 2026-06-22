'use client'

import { useContext } from 'react'
import { UnidadesContext } from '@/contexts/UnidadesContext'

export function useUnidades() {
  const ctx = useContext(UnidadesContext)
  if (!ctx) throw new Error('useUnidades must be used within UnidadesProvider')
  return ctx
}
