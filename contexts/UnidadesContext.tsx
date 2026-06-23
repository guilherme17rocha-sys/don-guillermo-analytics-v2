'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'
import { UnidadeOption } from '@/types/app'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const FALLBACK_UNIDADE: UnidadeOption = { id: '23060', nome: 'Shopping Metrópole - SBC' }

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
        const snap = await getDoc(doc(db, 'settings', 'global'))
        const token = snap.exists() ? snap.data().token_avec : null
        if (!token) {
          console.warn('[Unidades] Token AVEC não configurado')
          return
        }

        let lista: UnidadeOption[] = []

        const res = await fetch('/api/avec/unidades', {
          headers: { Authorization: token },
        })
        console.log(`[Unidades] 2052 resposta: ${res.status}`)

        if (res.ok) {
          const json = await res.json()
          lista = json.data || []
        }

        if (lista.length === 0) {
          console.log('[Unidades] 2052 falhou ou vazio, usando fallback 23060')
          lista = [FALLBACK_UNIDADE]
        }

        if (profile!.role !== 'admin' && profile!.unidades?.length) {
          lista = lista.filter((u) => profile!.unidades.includes(u.id))
        }

        setUnidades(lista)

        if (lista.length === 1 && lista[0].id) {
          setUnidadeSelecionada(lista[0].id)
        }
      } catch (err: any) {
        console.error('[Unidades] Erro ao carregar:', err.message)
        setUnidades([FALLBACK_UNIDADE])
        setUnidadeSelecionada(FALLBACK_UNIDADE.id)
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
