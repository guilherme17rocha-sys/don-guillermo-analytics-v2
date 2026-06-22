import { NextResponse } from 'next/server'
import { fetchReport } from '@/lib/avec-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const inicio = `01/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    const fim = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`

    const result = await fetchReport(2052, { inicio, fim })

    const unidades = result.map((r: any) => ({
      id: String(r.salao_id || r.id || r.unidade_id || ''),
      nome: r.salao || r.nome || r.unidade || r.name || 'Unidade',
    })).filter((u: any) => u.id)

    return NextResponse.json({ data: unidades })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
