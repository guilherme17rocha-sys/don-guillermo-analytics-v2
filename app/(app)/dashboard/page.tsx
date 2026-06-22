'use client'

import { useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/ui/MetricCard'
import { DataTable } from '@/components/ui/DataTable'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { PieChart } from '@/components/charts/PieChart'
import { BarChart } from '@/components/charts/BarChart'
import { useAvecData } from '@/hooks/useAvecData'
import { usePeriodo } from '@/hooks/usePeriodo'
import { useUnidades } from '@/hooks/useUnidades'
import { DollarSign, Users, TrendingUp, UserPlus, RotateCcw } from 'lucide-react'

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

export default function DashboardPage() {
  const { periodo } = usePeriodo()
  const { unidadeSelecionada } = useUnidades()

  const params = useMemo(() => ({
    inicio: periodo.inicio,
    fim: periodo.fim,
    ...(unidadeSelecionada !== 'all' ? { salao_unidade_id: unidadeSelecionada } : {}),
  }), [periodo, unidadeSelecionada])

  const faturamento = useAvecData({ reportId: 1034, params })
  const atendimentos = useAvecData({ reportId: 2005, params })
  const ticketMedio = useAvecData({ reportId: 1010, params })
  const novosClientes = useAvecData({ reportId: 2008, params })
  const retorno = useAvecData({ reportId: 1035, params })
  const crescimento = useAvecData({ reportId: 2011, params })

  const totalFaturamento = useMemo(() =>
    faturamento.data.reduce((s, r) => s + (parseFloat(r.valor || r.total || r.faturamento || 0)), 0),
    [faturamento.data])

  const totalAtendimentos = useMemo(() =>
    atendimentos.data.reduce((s, r) => s + (parseInt(r.total || r.atendimentos || r.quantidade || 0)), 0),
    [atendimentos.data])

  const avgTicket = useMemo(() => {
    if (!ticketMedio.data.length) return 0
    const vals = ticketMedio.data.map(r => parseFloat(r.ticket_medio || r.valor || 0)).filter(Boolean)
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
  }, [ticketMedio.data])

  const totalNovos = useMemo(() =>
    novosClientes.data.reduce((s, r) => s + parseInt(r.total || r.quantidade || 0), 0),
    [novosClientes.data])

  const taxaRetorno = useMemo(() => {
    if (!retorno.data.length) return 0
    const vals = retorno.data.map(r => parseFloat(r.percentual_retorno || r.percentual || r.taxa || 0)).filter(Boolean)
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
  }, [retorno.data])

  const pieData = useMemo(() =>
    faturamento.data.slice(0, 8).map(r => ({
      name: r.categoria || r.descricao || r.nome || 'Outros',
      value: parseFloat(r.valor || r.total || r.faturamento || 0),
    })).filter(d => d.value > 0),
    [faturamento.data])

  const barData = useMemo(() =>
    crescimento.data.slice(0, 10).map(r => ({
      unidade: (r.unidade || r.salao || r.nome || '').substring(0, 15),
      faturamento: parseFloat(r.faturamento || r.valor || 0),
    })),
    [crescimento.data])

  const tableData = useMemo(() => {
    const map: Record<string, any> = {}
    crescimento.data.forEach(r => {
      const key = r.unidade || r.salao || 'Geral'
      if (!map[key]) map[key] = { unidade: key, faturamento: 0, atendimentos: 0 }
      map[key].faturamento += parseFloat(r.faturamento || r.valor || 0)
    })
    return Object.values(map)
  }, [crescimento.data])

  const anyError = faturamento.error || atendimentos.error || ticketMedio.error

  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" />
      <div className="flex-1 p-6 space-y-6 overflow-auto">

        {anyError && <ErrorMessage message={anyError} onRetry={() => { faturamento.refetch(); atendimentos.refetch() }} />}

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Faturamento Total"
            value={formatBRL(totalFaturamento)}
            icon={DollarSign}
            color="amber"
            loading={faturamento.loading}
          />
          <MetricCard
            title="Atendimentos"
            value={totalAtendimentos.toLocaleString('pt-BR')}
            icon={Users}
            color="blue"
            loading={atendimentos.loading}
          />
          <MetricCard
            title="Ticket Médio"
            value={formatBRL(avgTicket)}
            icon={TrendingUp}
            color="green"
            loading={ticketMedio.loading}
          />
          <MetricCard
            title="Novos Clientes"
            value={totalNovos.toLocaleString('pt-BR')}
            icon={UserPlus}
            color="purple"
            loading={novosClientes.loading}
          />
          <MetricCard
            title="Taxa de Retorno"
            value={`${taxaRetorno.toFixed(1)}%`}
            icon={RotateCcw}
            color="amber"
            loading={retorno.loading}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Faturamento por Categoria</h3>
            {faturamento.loading ? (
              <div className="h-64 bg-zinc-50 animate-pulse rounded-lg flex items-center justify-center">
                <p className="text-zinc-400 text-sm">Carregando...</p>
              </div>
            ) : pieData.length > 0 ? (
              <PieChart data={pieData} formatValue={formatBRL} height={260} />
            ) : (
              <p className="text-zinc-400 text-sm text-center py-16">Sem dados para o período</p>
            )}
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Faturamento por Unidade</h3>
            {crescimento.loading ? (
              <div className="h-64 bg-zinc-50 animate-pulse rounded-lg flex items-center justify-center">
                <p className="text-zinc-400 text-sm">Carregando...</p>
              </div>
            ) : barData.length > 0 ? (
              <BarChart
                data={barData}
                bars={[{ key: 'faturamento', label: 'Faturamento' }]}
                xKey="unidade"
                formatValue={formatBRL}
                height={260}
              />
            ) : (
              <p className="text-zinc-400 text-sm text-center py-16">Sem dados para o período</p>
            )}
          </div>
        </div>

        {/* Tabela resumo */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-800 mb-4">Resumo por Unidade</h3>
          <DataTable
            columns={[
              { key: 'unidade', label: 'Unidade' },
              { key: 'faturamento', label: 'Faturamento', align: 'right', render: (r) => formatBRL(r.faturamento) },
              { key: 'atendimentos', label: 'Atendimentos', align: 'right' },
            ]}
            data={tableData}
            loading={crescimento.loading}
          />
        </div>
      </div>
    </div>
  )
}
