import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.AVEC_API_BASE_URL || 'https://api.avec.beauty/reports/'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 })
    }

    const now = new Date()
    const inicio = `01/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    const fim = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

    const fullUrl = `${BASE_URL}2052?inicio=${inicio}&fim=${fim}&limit=250`
    console.log(`[AVEC API] Unidades → ${fullUrl}`)

    const res = await fetch(fullUrl, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error(`[AVEC API] Unidades erro ${res.status}: ${text}`)
      return NextResponse.json({ error: `Erro na API AVEC (${res.status})` }, { status: res.status })
    }

    const json = await res.json()
    const results = json?.Data?.Result || []

    const unidades = results.map((r: any) => ({
      id: String(r.salao_id || r.id || r.unidade_id || ''),
      nome: r.salao || r.nome || r.unidade || r.name || 'Unidade',
    })).filter((u: any) => u.id)

    return NextResponse.json({ data: unidades })
  } catch (err: any) {
    console.error('[AVEC API] Unidades erro:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
