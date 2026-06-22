import { NextRequest, NextResponse } from 'next/server'
import { fetchReport } from '@/lib/avec-api'
import { AvecParams } from '@/types/avec'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const reportId = parseInt(params.reportId, 10)

  if (isNaN(reportId)) {
    return NextResponse.json({ error: 'ID de relatório inválido' }, { status: 400 })
  }

  try {
    const body: Omit<AvecParams, 'page'> = await request.json()

    if (!body.inicio || !body.fim) {
      return NextResponse.json({ error: 'Parâmetros inicio e fim são obrigatórios' }, { status: 400 })
    }

    const data = await fetchReport(reportId, body)
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
