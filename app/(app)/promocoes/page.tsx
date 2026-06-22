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
import { Tag, Package, Star, MapPin } from 'lucide-react'

export default function PromocoesPage() {
  const { periodo } = usePeriodo()
  const { unidadeSelecionada } = useUnidades()

  const params = useMemo(() => ({
    inicio: periodo.inicio,
    fim: periodo.fim,
    ...(unidadeSelecionada !== 'all' ? { salao_unidade_id: unidadeSelecionada } : {}),
  }), [periodo, unidadeSelecionada])

  const taxaAdesao = useAvecData({ reportId: 1046, params })
  const pacotesUtilizados = useAvecData({ reportId: 1064, params })
  const pontuacaoClube = useAvecData({ reportId: 1040, params })
  const pacotesMarca = useAvecData({ reportId: 1161, params })
  const pacotesLoja = useAvecData({ reportId: 1162, params })
  const origemReservas = useAvecData({ reportId: 1056, params })

  const avgAdesao = useMemo(() => {
    const vals = taxaAdesao.data.map(r => parseFloat(r.taxa || r.percentual || 0)).filter(Boolean)
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
  }, [taxaAdesao.data])

  const totalPacotes = useMemo(() =>
    pacotesUtilizados.data.reduce((s, r) => s + parseInt(r.quantidade || r.total || 0), 0),
    [pacotesUtilizados.data])

  const totalPontos = useMemo(() =>
    pontuacaoClube.data.reduce((s, r) => s + parseInt(r.pontos || r.total || 0), 0),
    [pontuacaoClube.data])

  const pieOrigens = useMemo(() =>
    origemReservas.data.map(r => ({
      name: r.origem || r.canal || r.source || 'Outros',
      value: parseInt(r.total || r.quantidade || 0),
    })).filter(d => d.value > 0),
    [origemReservas.data])

  const barAdesao = useMemo(() =>
    taxaAdesao.data.slice(0, 10).map(r => ({
      unidade: (r.unidade || r.salao || '').substring(0, 15),
      taxa: parseFloat(r.taxa || r.percentual || 0),
    })).filter(d => d.taxa > 0),
    [taxaAdesao.data])

  return (
    <div className="flex flex-col h-full">
      <Header title="Promoções e Pacotes" />
      <div className="flex-1 p-6 overflow-auto space-y-6">
        {taxaAdesao.error && <ErrorMessage message={taxaAdesao.error} onRetry={taxaAdesao.refetch} />}

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4">
          <MetricCard title="Taxa de Adesão Média" value={`${avgAdesao.toFixed(1)}%`} icon={Tag} color="amber" loading={taxaAdesao.loading} />
          <MetricCard title="Pacotes Utilizados" value={totalPacotes.toLocaleString('pt-BR')} icon={Package} color="blue" loading={pacotesUtilizados.loading} />
          <MetricCard title="Pontos Clube da Cera" value={totalPontos.toLocaleString('pt-BR')} icon={Star} color="amber" loading={pontuacaoClube.loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Adesão por Unidade */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Taxa de Adesão por Unidade</h3>
            {taxaAdesao.loading ? (
              <div className="h-64 bg-zinc-50 animate-pulse rounded-lg" />
            ) : barAdesao.length > 0 ? (
              <BarChart
                data={barAdesao}
                bars={[{ key: 'taxa', label: 'Taxa de Adesão (%)' }]}
                xKey="unidade"
                formatValue={(v) => `${v.toFixed(1)}%`}
                height={260}
              />
            ) : (
              <p className="text-zinc-400 text-sm text-center py-16">Sem dados</p>
            )}
          </div>

          {/* Origem das Reservas */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Origem das Reservas</h3>
            {origemReservas.loading ? (
              <div className="h-64 bg-zinc-50 animate-pulse rounded-lg" />
            ) : pieOrigens.length > 0 ? (
              <PieChart data={pieOrigens} height={260} />
            ) : (
              <p className="text-zinc-400 text-sm text-center py-16">Sem dados</p>
            )}
          </div>
        </div>

        {/* Pacotes por unidade */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-800 mb-4">Pacotes Utilizados nas Unidades</h3>
          <DataTable
            columns={[
              { key: 'nome', label: 'Pacote', render: r => r.nome || r.descricao || r.pacote || '-' },
              { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
              { key: 'quantidade', label: 'Qtd', align: 'right', render: r => r.quantidade || r.total || '-' },
              { key: 'valor', label: 'Valor', align: 'right', render: r => {
                const v = parseFloat(r.valor || r.valor_total || 0)
                return v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : '-'
              }},
            ]}
            data={[...pacotesUtilizados.data, ...pacotesMarca.data, ...pacotesLoja.data]}
            loading={pacotesUtilizados.loading}
          />
        </div>

        {/* Clube da Cera */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-800 mb-4">Clube da Cera — Pontuação</h3>
          <DataTable
            columns={[
              { key: 'cliente', label: 'Cliente', render: r => r.cliente || r.nome || '-' },
              { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
              { key: 'pontos', label: 'Pontos', align: 'right', render: r => parseInt(r.pontos || r.total || 0).toLocaleString('pt-BR') },
            ]}
            data={pontuacaoClube.data}
            loading={pontuacaoClube.loading}
          />
        </div>
      </div>
    </div>
  )
}
