'use client'

import { useState, useEffect, useCallback } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { fetchReport } from '@/lib/avec-api'
import { AvecParams } from '@/types/avec'

interface UseAvecDataOptions {
  reportId: number
  params: Omit<AvecParams, 'page'>
  enabled?: boolean
}

interface UseAvecDataResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => void
}

async function getTokenClientSide(): Promise<string> {
  const snap = await getDoc(doc(db, 'settings', 'global'))
  if (!snap.exists()) throw new Error('Token AVEC não configurado. Acesse Sincronização para configurar.')
  const token = snap.data().token_avec
  if (!token) throw new Error('Token AVEC não configurado. Acesse Sincronização para configurar.')
  return token
}

export function useAvecData<T = any>({ reportId, params, enabled = true }: UseAvecDataOptions): UseAvecDataResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const doFetch = useCallback(async () => {
    if (!enabled || !params.inicio || !params.fim) return

    setLoading(true)
    setError(null)

    try {
      const token = await getTokenClientSide()
      const results = await fetchReport(reportId, params, token)
      setData((results || []) as T[])
    } catch (err: any) {
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [reportId, JSON.stringify(params), enabled])

  useEffect(() => {
    doFetch()
  }, [doFetch])

  return { data, loading, error, refetch: doFetch }
}
