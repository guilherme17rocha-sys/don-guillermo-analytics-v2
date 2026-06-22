import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { AvecParams, AvecReportResponse } from '@/types/avec'

const BASE_URL = process.env.AVEC_API_BASE_URL || 'https://api.avec.beauty/reports/'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hora

async function getToken(): Promise<string> {
  const snap = await getDoc(doc(db, 'settings', 'global'))
  if (!snap.exists()) throw new Error('Token AVEC não configurado. Acesse Sincronização para configurar.')
  const token = snap.data().token_avec
  if (!token) throw new Error('Token AVEC não configurado. Acesse Sincronização para configurar.')
  return token
}

function buildCacheKey(reportId: number, params: AvecParams): string {
  const periodo = `${params.inicio}-${params.fim}`
  const unidade = params.salao_unidade_id || 'all'
  return `cache/${reportId}/${periodo}/${unidade}`
}

async function setCache(cacheKey: string, result: any[]): Promise<void> {
  try {
    const parts = cacheKey.split('/')
    const ref = doc(db, parts[0], parts.slice(1).join('__'))
    await setDoc(ref, {
      result,
      expiresAt: Date.now() + CACHE_TTL_MS,
      cachedAt: Date.now(),
    })
  } catch {
    // cache write failure is non-fatal
  }
}

async function clearCache(_reportId?: number): Promise<void> {
  // Client-side cache clearing is limited; this marks cache as expired
  // Full clearing should be done server-side or via admin panel
}

async function fetchPage(
  token: string,
  reportId: number,
  params: AvecParams
): Promise<AvecReportResponse> {
  const url = new URL(`${BASE_URL}${reportId}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
  })

  if (res.status === 401 || res.status === 403) {
    throw new Error('Token AVEC inválido ou expirado. Atualize o token em Sincronização.')
  }

  if (!res.ok) {
    throw new Error(`Erro na API AVEC (${res.status}): ${res.statusText}`)
  }

  return res.json()
}

export async function fetchReport(
  reportId: number,
  params: Omit<AvecParams, 'page'>,
  tokenOverride?: string
): Promise<any[]> {
  const token = tokenOverride || await getToken()
  const fullParams = params as AvecParams
  const allResults: any[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const response = await fetchPage(token, reportId, { ...fullParams, page, limit: 250 })
    const data = response?.Data

    if (!data) break

    const result = Array.isArray(data.Result) ? data.Result : []
    allResults.push(...result)
    hasMore = data.HasMore === true
    page++
  }

  try {
    const cacheKey = buildCacheKey(reportId, fullParams)
    await setCache(cacheKey, allResults)
  } catch {
    // Firestore permission error — ignore, data already fetched
  }
  return allResults
}

export async function testConnection(): Promise<{ success: boolean; unidades?: any[]; error?: string }> {
  try {
    const token = await getToken()
    const today = new Date()
    const inicio = `01/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    const fim = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    const response = await fetchPage(token, 2052, { inicio, fim, limit: 250 })
    return { success: true, unidades: response?.Data?.Result || [] }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function invalidateCache(reportId?: number): Promise<void> {
  await clearCache(reportId)
}

export { getToken }
