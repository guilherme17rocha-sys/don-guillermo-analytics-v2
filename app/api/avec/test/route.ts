import { NextResponse } from 'next/server'
import { testConnection } from '@/lib/avec-api'

export const dynamic = 'force-dynamic'

export async function GET() {
  const result = await testConnection()
  return NextResponse.json(result)
}
