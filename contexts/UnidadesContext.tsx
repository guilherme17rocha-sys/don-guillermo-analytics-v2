'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'
import { UnidadeOption } from '@/types/app'
import { useAuth } from '@/hooks/useAuth'

interface UnidadesContextValue {
  unidades: UnidadeOption[]
  unidadeSelecionada: string
  setUnidadeSelecionada: (id: string) => void
  loading: boolean
}

export const UnidadesContext = createContext<UnidadesContextValue | null>(null)

export function UnidadesProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [unidades, setUnidades] = useState<UnidadeOption[]>([])
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!profile || profile.status !== 'approved') return

    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/avec/unidades')
        if (!res.ok) return
        const json = await res.json()
        let lista: UnidadeOption[] = json.data || []

        if (profile!.role !== 'admin' && profile!.unidades?.length) {
          lista = lista.filter((u) => profile!.unidades.includes(u.id))
        }

        setUnidades(lista)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [profile])

  return (
    <UnidadesContext.Provider value={{ unidades, unidadeSelecionada, setUnidadeSelecionada, loading }}>
      {children}
    </UnidadesContext.Provider>
  )
}
