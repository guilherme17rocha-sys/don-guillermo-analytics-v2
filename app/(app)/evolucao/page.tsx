'use client'

import { useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import { useAvecData } from '@/hooks/useAvecData'
import { usePeriodo } from '@/hooks/usePeriodo'
import { useUnidades } from '@/hooks/useUnidades'

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

function ChartSkeleton() {
  return (
    <div className="h-64 bg-zinc-50 animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-zinc-400 text-sm">Carregando...</p>
    </div>
  )
}

export default function EvolucaoPage() {
  const { periodo } = usePeriodo()
  useUnidades()

  const params = useMemo(() => ({
    inicio: periodo.inicio,
    fim: periodo.fim,
  }), [periodo])

  const crescimentoParams = useMemo(() => {
    const [, mesStr, anoStr] = periodo.inicio.split('/')
    const mes = parseInt(mesStr, 10)
    const ano = parseInt(anoStr, 10)
    const prevMes = mes === 1 ? 12 : mes - 1
    const prevAno = mes === 1 ? ano - 1 : ano
    const lastDayPrev = new Date(ano, mes - 1, 0).getDate()

    return {
      inicio1: `01/${String(prevMes).padStart(2, '0')}/${prevAno}`,
      fim1: `${String(lastDayPrev).padStart(2, '0')}/${String(prevMes).padStart(2, '0')}/${prevAno}`,
      inicio2: periodo.inicio,
      fim2: periodo.fim,
    }
  }, [periodo])

  const crescimentoUnidade = useAvecData({ reportId: 2011, params: crescimentoParams })
  const taxaAtivPeriodo = useAvecData({ reportId: 2003, params })
  const taxaAtivGeral = useAvecData({ reportId: 2004, params })
  const retornoGeral = useAvecData({ reportId: 1035, params })
  const retornoM1 = useAvecData({ reportId: 1036, params })
  const atendimentos = useAvecData({ reportId: 2005, params })
  const novosClientes = useAvecData({ reportId: 2008, params })

  const faturLineData = useMemo(() =>
    crescimentoUnidade.data.slice(0, 12).map((r, i) => ({
      periodo: r.mes || r.periodo || r.data || `M${i + 1}`,
      faturamento: parseFloat(r.faturamento || r.valor || 0),
    })),
    [crescimentoUnidade.data])

  const retornoLineData = useMemo(() =>
    retornoGeral.data.slice(0, 12).map((r, i) => ({
      mes: r.mes || r.data || `M${i + 1}`,
      retorno_geral: parseFloat(r.percentual_retorno || r.percentual || r.taxa || 0),
      retorno_m1: parseFloat(retornoM1.data[i]?.percentual_retorno || retornoM1.data[i]?.percentual || 0),
    })),
    [retornoGeral.data, retornoM1.data])

  const ativLineData = useMemo(() =>
    taxaAtivPeriodo.data.slice(0, 12).map((r, i) => ({
      mes: r.mes || r.data || `M${i + 1}`,
      periodo: parseFloat(r.taxa || r.percentual || 0),
      geral: parseFloat(taxaAtivGeral.data[i]?.taxa || taxaAtivGeral.data[i]?.percentual || 0),
    })),
    [taxaAtivPeriodo.data, taxaAtivGeral.data])

  const atendLineData = useMemo(() =>
    atendimentos.data.slice(0, 12).map((r, i) => ({
      mes: r.mes || r.data || `M${i + 1}`,
      atendimentos: parseInt(r.total || r.atendimentos || 0),
      novos: parseInt(novosClientes.data[i]?.total || novosClientes.data[i]?.quantidade || 0),
    })),
    [atendimentos.data, novosClientes.data])

  const anyError = crescimentoUnidade.error || retornoGeral.error

  return (
    <div className="flex flex-col h-full">
      <Header title="Evolução" />
      <div className="flex-1 p-6 overflow-auto space-y-6">
        {anyError && <ErrorMessage message={anyError} onRetry={() => { crescimentoUnidade.refetch(); retornoGeral.refetch() }} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Crescimento de Faturamento por Unidade</h3>
            {crescimentoUnidade.loading ? (
              <ChartSkeleton />
            ) : faturLineData.length > 0 ? (
              <LineChart
                data={faturLineData}
                lines={[{ key: 'faturamento', label: 'Faturamento' }]}
                xKey="periodo"
                formatValue={formatBRL}
                height={260}
              />
            ) : (
              <p className="text-zinc-400 text-sm text-center py-16">Sem dados para o período selecionado</p>
            )}
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Taxa de Ativação</h3>
            {taxaAtivPeriodo.loading ? (
              <ChartSkeleton />
            ) : ativLineData.length > 0 ? (
              <LineChart
                data={ativLineData}
                lines={[
                  { key: 'periodo', label: 'Ativação do Período', color: '#f59e0b' },
                  { key: 'geral', label: 'Ativação Geral', color: '#3b82f6' },
                ]}
                xKey="mes"
                formatValue={(v) => `${v.toFixed(1)}%`}
                height={260}
              />
            ) : (
              <p className="text-zinc-400 text-sm text-center py-16">Sem dados para o período selecionado</p>
            )}
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Retorno ao Longo do Tempo</h3>
            {retornoGeral.loading ? (
              <ChartSkeleton />
            ) : retornoLineData.length > 0 ? (
              <BarChart
                data={retornoLineData}
                bars={[
                  { key: 'retorno_geral', label: 'Retorno Geral', color: '#f59e0b' },
                  { key: 'retorno_m1', label: 'Retorno M-1', color: '#10b981' },
                ]}
                xKey="mes"
                formatValue={(v) => `${v.toFixed(1)}%`}
                height={260}
              />
            ) : (
              <p className="text-zinc-400 text-sm text-center py-16">Sem dados para o período selecionado</p>
            )}
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Atendimentos e Novos Clientes</h3>
            {atendimentos.loading ? (
              <ChartSkeleton />
            ) : atendLineData.length > 0 ? (
              <LineChart
                data={atendLineData}
                lines={[
                  { key: 'atendimentos', label: 'Atendimentos', color: '#3b82f6' },
                  { key: 'novos', label: 'Novos Clientes', color: '#10b981' },
                ]}
                xKey="mes"
                height={260}
              />
            ) : (
              <p className="text-zinc-400 text-sm text-center py-16">Sem dados para o período selecionado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
