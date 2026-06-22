'use client'

import { useState, useEffect, useCallback } from 'react'
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

export function useAvecData<T = any>({ reportId, params, enabled = true }: UseAvecDataOptions): UseAvecDataResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!enabled || !params.inicio || !params.fim) return

    setLoading(true)
    setError(null)

    try {
      const res = await window.fetch(`/api/avec/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao carregar dados')
      }

      const json = await res.json()
      setData(json.data || [])
    } catch (err: any) {
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [reportId, JSON.stringify(params), enabled])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
