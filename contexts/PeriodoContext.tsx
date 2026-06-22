'use client'

import { createContext, useState, ReactNode, useCallback } from 'react'
import { PeriodoState } from '@/types/app'

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

function getMesAtual(): PeriodoState {
  const now = new Date()
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1)
  return {
    inicio: formatDate(inicio),
    fim: formatDate(now),
    label: 'Este mês',
  }
}

interface PeriodoContextValue {
  periodo: PeriodoState
  setPeriodo: (p: PeriodoState) => void
  setPreset: (preset: string) => void
}

export const PeriodoContext = createContext<PeriodoContextValue | null>(null)

export function PeriodoProvider({ children }: { children: ReactNode }) {
  const [periodo, setPeriodo] = useState<PeriodoState>(getMesAtual())

  const setPreset = useCallback((preset: string) => {
    const now = new Date()

    const presets: Record<string, PeriodoState> = {
      hoje: {
        inicio: formatDate(now),
        fim: formatDate(now),
        label: 'Hoje',
      },
      semana: {
        inicio: formatDate(new Date(now.getTime() - 7 * 86400000)),
        fim: formatDate(now),
        label: 'Esta semana',
      },
      mes: getMesAtual(),
      mes_anterior: (() => {
        const inicio = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const fim = new Date(now.getFullYear(), now.getMonth(), 0)
        return { inicio: formatDate(inicio), fim: formatDate(fim), label: 'Mês anterior' }
      })(),
      tres_meses: {
        inicio: formatDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
        fim: formatDate(now),
        label: 'Últimos 3 meses',
      },
    }

    if (presets[preset]) setPeriodo(presets[preset])
  }, [])

  return (
    <PeriodoContext.Provider value={{ periodo, setPeriodo, setPreset }}>
      {children}
    </PeriodoContext.Provider>
  )
}
