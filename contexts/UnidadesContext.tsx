'use client'

import { createContext, useState, useEffect, ReactNode } from 'react'
import { UnidadeOption } from '@/types/app'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

const AVEC_BASE_URL = 'https://api.avec.beauty/reports/'

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
          console.log('[Unidades] 2052 falhou ou vazio, tentando descobrir unidade via 2005...')
          try {
            const now = new Date()
            const inicio = `01/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
            const fim = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
            const fallbackUrl = `${AVEC_BASE_URL}2005?inicio=${inicio}&fim=${fim}&page=1&limit=1`
            console.log(`[Unidades] Fallback 2005 → ${fallbackUrl}`)
            const fallbackRes = await fetch(fallbackUrl, {
              headers: { Authorization: token, 'Content-Type': 'application/json' },
            })
            if (fallbackRes.ok) {
              const fallbackJson = await fallbackRes.json()
              const record = fallbackJson?.Data?.Result?.[0]
              if (record) {
                const id = String(record.salao_id || record.salao_unidade_id || record.id || record.unidade_id || '')
                const nome = record.salao || record.unidade || record.nome || 'Unidade SBC'
                console.log(`[Unidades] Unidade descoberta via 2005: id=${id}, nome=${nome}`)
                if (id) {
                  lista = [{ id, nome }]
                }
              }
            }
          } catch (err: any) {
            console.warn('[Unidades] Fallback 2005 também falhou:', err.message)
          }
        }

        if (lista.length === 0) {
          console.log('[Unidades] Usando fallback padrão: Unidade SBC')
          lista = [{ id: '', nome: 'Unidade SBC' }]
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
        setUnidades([{ id: '', nome: 'Unidade SBC' }])
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
