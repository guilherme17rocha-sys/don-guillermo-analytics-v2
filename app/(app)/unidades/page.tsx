'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { useAvecData } from '@/hooks/useAvecData'
import { usePeriodo } from '@/hooks/usePeriodo'
import { useUnidades } from '@/hooks/useUnidades'
import { Building2, ArrowRight, DollarSign, Users, TrendingUp, UserPlus } from 'lucide-react'

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

function UnidadeCard({ unidade, params }: { unidade: { id: string; nome: string }; params: any }) {
  const unidadeParams = { ...params, salao_unidade_id: unidade.id }

  const faturamento = useAvecData({ reportId: 1034, params: unidadeParams })
  const atendimentos = useAvecData({ reportId: 2005, params: unidadeParams })
  const ticketMedio = useAvecData({ reportId: 1010, params: unidadeParams })
  const novosClientes = useAvecData({ reportId: 2008, params: unidadeParams })

  const totalFat = faturamento.data.reduce((s, r) => s + parseFloat(r.valor || r.total || r.faturamento || 0), 0)
  const totalAt = atendimentos.data.reduce((s, r) => s + parseInt(r.total || r.atendimentos || 0), 0)
  const avgTicket = (() => {
    const vals = ticketMedio.data.map(r => parseFloat(r.ticket_medio || r.valor || 0)).filter(Boolean)
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
  })()
  const totalNovos = novosClientes.data.reduce((s, r) => s + parseInt(r.total || r.quantidade || 0), 0) || novosClientes.data.length

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <Building2 size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-800">{unidade.nome}</h3>
            <p className="text-xs text-zinc-400">ID: {unidade.id}</p>
          </div>
        </div>
        <Link
          href={`/unidades/${unidade.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-lg hover:bg-amber-100 transition-colors"
        >
          Ver detalhes
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-zinc-50 rounded-lg">
          <p className="text-xs text-zinc-500 mb-1">Faturamento</p>
          {faturamento.loading ? (
            <div className="h-5 bg-zinc-200 rounded animate-pulse" />
          ) : (
            <p className="font-semibold text-sm text-zinc-800">{formatBRL(totalFat)}</p>
          )}
        </div>
        <div className="text-center p-3 bg-zinc-50 rounded-lg">
          <p className="text-xs text-zinc-500 mb-1">Atendimentos</p>
          {atendimentos.loading ? (
            <div className="h-5 bg-zinc-200 rounded animate-pulse" />
          ) : (
            <p className="font-semibold text-sm text-zinc-800">{totalAt.toLocaleString('pt-BR')}</p>
          )}
        </div>
        <div className="text-center p-3 bg-zinc-50 rounded-lg">
          <p className="text-xs text-zinc-500 mb-1">Ticket Médio</p>
          {ticketMedio.loading ? (
            <div className="h-5 bg-zinc-200 rounded animate-pulse" />
          ) : (
            <p className="font-semibold text-sm text-zinc-800">{formatBRL(avgTicket)}</p>
          )}
        </div>
        <div className="text-center p-3 bg-zinc-50 rounded-lg">
          <p className="text-xs text-zinc-500 mb-1">Novos Clientes</p>
          {novosClientes.loading ? (
            <div className="h-5 bg-zinc-200 rounded animate-pulse" />
          ) : (
            <p className="font-semibold text-sm text-zinc-800">{totalNovos.toLocaleString('pt-BR')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UnidadesPage() {
  const { periodo } = usePeriodo()
  const { unidades, loading } = useUnidades()

  const params = useMemo(() => ({
    inicio: periodo.inicio,
    fim: periodo.fim,
  }), [periodo])

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Unidades" />
        <div className="flex-1 p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse">
              <div className="h-6 bg-zinc-200 rounded w-1/3 mb-4" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-16 bg-zinc-100 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Unidades" />
      <div className="flex-1 p-6 overflow-auto space-y-4">
        {unidades.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={48} className="text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500">Nenhuma unidade disponível.</p>
            <p className="text-sm text-zinc-400 mt-1">Configure o token AVEC em Sincronização.</p>
          </div>
        ) : (
          unidades.map(u => (
            <UnidadeCard key={u.id} unidade={u} params={params} />
          ))
        )}
      </div>
    </div>
  )
}
