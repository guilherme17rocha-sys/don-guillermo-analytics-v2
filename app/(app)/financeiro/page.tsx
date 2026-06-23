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
import { DollarSign, TrendingDown, TrendingUp, Receipt } from 'lucide-react'

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

export default function FinanceiroPage() {
  const { periodo } = usePeriodo()
  useUnidades()

  const params = useMemo(() => ({
    inicio: periodo.inicio,
    fim: periodo.fim,
  }), [periodo])

  const faturamento = useAvecData({ reportId: 1034, params })
  const despesas = useAvecData({ reportId: 1386, params })
  const royalties = useAvecData({ reportId: 1081, params })
  const comandasAg = useAvecData({ reportId: 2187, params })

  const totalFaturamento = useMemo(() =>
    faturamento.data.reduce((s, r) => s + parseFloat(r.valor || r.total || r.faturamento || 0), 0),
    [faturamento.data])

  const totalDespesas = useMemo(() =>
    despesas.data.reduce((s, r) => s + parseFloat(r.valor || r.total || 0), 0),
    [despesas.data])

  const totalRoyalties = useMemo(() =>
    royalties.data.reduce((s, r) => s + parseFloat(r.valor_royalty || r.royalty || r.valor || 0), 0),
    [royalties.data])

  const resultado = totalFaturamento - totalDespesas

  const pieFaturamento = useMemo(() =>
    faturamento.data.slice(0, 8).map(r => ({
      name: r.categoria || r.descricao || r.nome || 'Outros',
      value: parseFloat(r.valor || r.total || r.faturamento || 0),
    })).filter(d => d.value > 0),
    [faturamento.data])

  const barDespesas = useMemo(() =>
    despesas.data.slice(0, 10).map(r => ({
      categoria: (r.categoria || r.descricao || 'Outros').substring(0, 20),
      valor: parseFloat(r.valor || r.total || 0),
    })).filter(d => d.valor > 0),
    [despesas.data])

  return (
    <div className="flex flex-col h-full">
      <Header title="Financeiro" />
      <div className="flex-1 p-6 overflow-auto space-y-6">
        {faturamento.error && <ErrorMessage message={faturamento.error} onRetry={faturamento.refetch} />}

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Faturamento Bruto" value={formatBRL(totalFaturamento)} icon={DollarSign} color="green" loading={faturamento.loading} />
          <MetricCard title="Total de Despesas" value={formatBRL(totalDespesas)} icon={TrendingDown} color="red" loading={despesas.loading} />
          <MetricCard
            title="Resultado Líquido"
            value={formatBRL(resultado)}
            icon={TrendingUp}
            color={resultado >= 0 ? 'green' : 'red'}
            loading={faturamento.loading || despesas.loading}
          />
          <MetricCard title="Royalties Devidos" value={formatBRL(totalRoyalties)} icon={Receipt} color="amber" loading={royalties.loading} />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Faturamento por Categoria</h3>
            {faturamento.loading ? (
              <div className="h-64 bg-zinc-50 animate-pulse rounded-lg flex items-center justify-center">
                <p className="text-zinc-400 text-sm">Carregando...</p>
              </div>
            ) : pieFaturamento.length > 0 ? (
              <PieChart data={pieFaturamento} formatValue={formatBRL} height={260} />
            ) : (
              <p className="text-zinc-400 text-sm text-center py-16">Sem dados</p>
            )}
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Despesas por Categoria</h3>
            {despesas.loading ? (
              <div className="h-64 bg-zinc-50 animate-pulse rounded-lg flex items-center justify-center">
                <p className="text-zinc-400 text-sm">Carregando...</p>
              </div>
            ) : barDespesas.length > 0 ? (
              <BarChart data={barDespesas} bars={[{ key: 'valor', label: 'Valor', color: '#f43f5e' }]} xKey="categoria" formatValue={formatBRL} height={260} />
            ) : (
              <p className="text-zinc-400 text-sm text-center py-16">Sem dados</p>
            )}
          </div>
        </div>

        {/* Royalties */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-800 mb-4">Royalties por Unidade</h3>
          <DataTable
            columns={[
              { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
              { key: 'faturamento_base', label: 'Fat. Base', align: 'right', render: r => formatBRL(parseFloat(r.faturamento_base || r.faturamento || 0)) },
              { key: 'percentual_royalty', label: '% Royalty', align: 'right', render: r => `${parseFloat(r.percentual_royalty || r.percentual || 0).toFixed(1)}%` },
              { key: 'valor_royalty', label: 'Valor Royalty', align: 'right', render: r => formatBRL(parseFloat(r.valor_royalty || r.royalty || r.valor || 0)) },
            ]}
            data={royalties.data}
            loading={royalties.loading}
          />
        </div>

        {/* Comandas */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-800 mb-4">Comandas do Período</h3>
          <DataTable
            columns={[
              { key: 'data', label: 'Data', render: r => r.data || r.dt || '-' },
              { key: 'cliente', label: 'Cliente', render: r => r.cliente || r.nome_cliente || '-' },
              { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
              { key: 'valor_total', label: 'Valor', align: 'right', render: r => formatBRL(parseFloat(r.valor_total || r.valor || r.total || 0)) },
            ]}
            data={comandasAg.data}
            loading={comandasAg.loading}
            maxRows={50}
          />
        </div>
      </div>
    </div>
  )
}
