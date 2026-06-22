'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { DataTable } from '@/components/ui/DataTable'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { BarChart } from '@/components/charts/BarChart'
import { useAvecData } from '@/hooks/useAvecData'
import { usePeriodo } from '@/hooks/usePeriodo'
import { useUnidades } from '@/hooks/useUnidades'

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

const TABS = ['Serviços', 'Procedimentos', 'Produtos', 'Comandas']

export default function AnalisePage() {
  const { periodo } = usePeriodo()
  const { unidadeSelecionada } = useUnidades()
  const [activeTab, setActiveTab] = useState('Serviços')

  const params = useMemo(() => ({
    inicio: periodo.inicio,
    fim: periodo.fim,
    ...(unidadeSelecionada !== 'all' ? { salao_unidade_id: unidadeSelecionada } : {}),
  }), [periodo, unidadeSelecionada])

  const servicos = useAvecData({ reportId: 1031, params, enabled: activeTab === 'Serviços' })
  const faturCat = useAvecData({ reportId: 1034, params, enabled: activeTab === 'Serviços' })
  const procedimentos = useAvecData({ reportId: 2006, params, enabled: activeTab === 'Procedimentos' })
  const procedimentos2 = useAvecData({ reportId: 1020, params, enabled: activeTab === 'Procedimentos' })
  const produtos = useAvecData({ reportId: 1042, params, enabled: activeTab === 'Produtos' })
  const itensPorLoja = useAvecData({ reportId: 2014, params, enabled: activeTab === 'Produtos' })
  const comandasItens = useAvecData({ reportId: 2186, params, enabled: activeTab === 'Comandas' })
  const comandasAg = useAvecData({ reportId: 2187, params, enabled: activeTab === 'Comandas' })

  const barDataServicos = useMemo(() =>
    faturCat.data.slice(0, 10).map(r => ({
      categoria: (r.categoria || r.descricao || r.nome || '').substring(0, 20),
      valor: parseFloat(r.valor || r.total || r.faturamento || 0),
    })).filter(d => d.valor > 0),
    [faturCat.data])

  return (
    <div className="flex flex-col h-full">
      <Header title="Análise" />
      <div className="flex-1 p-6 overflow-auto">

        {/* Abas */}
        <div className="flex border-b border-zinc-200 mb-6 gap-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab
                  ? 'bg-white border-t border-l border-r border-zinc-200 text-amber-600 -mb-px'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Serviços */}
        {activeTab === 'Serviços' && (
          <div className="space-y-6">
            {servicos.error && <ErrorMessage message={servicos.error} onRetry={servicos.refetch} />}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Faturamento por Categoria</h3>
              {faturCat.loading ? (
                <div className="h-64 bg-zinc-50 animate-pulse rounded-lg" />
              ) : barDataServicos.length > 0 ? (
                <BarChart data={barDataServicos} bars={[{ key: 'valor', label: 'Valor' }]} xKey="categoria" formatValue={formatBRL} height={280} />
              ) : (
                <p className="text-zinc-400 text-sm text-center py-16">Sem dados</p>
              )}
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Serviços por Loja</h3>
              <DataTable
                columns={[
                  { key: 'salao', label: 'Loja', render: r => r.salao || r.unidade || r.loja || '-' },
                  { key: 'descricao', label: 'Serviço', render: r => r.descricao || r.servico || r.nome || '-' },
                  { key: 'quantidade', label: 'Qtd', align: 'right', render: r => r.quantidade || r.total || '-' },
                  { key: 'valor', label: 'Valor', align: 'right', render: r => formatBRL(parseFloat(r.valor || r.faturamento || 0)) },
                ]}
                data={servicos.data}
                loading={servicos.loading}
              />
            </div>
          </div>
        )}

        {/* Procedimentos */}
        {activeTab === 'Procedimentos' && (
          <div className="space-y-6">
            {procedimentos.error && <ErrorMessage message={procedimentos.error} onRetry={procedimentos.refetch} />}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Procedimentos Realizados</h3>
              <DataTable
                columns={[
                  { key: 'nome', label: 'Procedimento', render: r => r.nome || r.descricao || r.procedimento || '-' },
                  { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || r.loja || '-' },
                  { key: 'quantidade', label: 'Qtd', align: 'right', render: r => r.quantidade || r.total || '-' },
                  { key: 'valor', label: 'Valor', align: 'right', render: r => formatBRL(parseFloat(r.valor || r.faturamento || 0)) },
                ]}
                data={[...procedimentos.data, ...procedimentos2.data]}
                loading={procedimentos.loading || procedimentos2.loading}
              />
            </div>
          </div>
        )}

        {/* Produtos */}
        {activeTab === 'Produtos' && (
          <div className="space-y-6">
            {produtos.error && <ErrorMessage message={produtos.error} onRetry={produtos.refetch} />}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Produtos Vendidos no Período</h3>
              <DataTable
                columns={[
                  { key: 'nome', label: 'Produto', render: r => r.nome || r.descricao || r.produto || '-' },
                  { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
                  { key: 'quantidade', label: 'Qtd', align: 'right', render: r => r.quantidade || r.total || '-' },
                  { key: 'valor', label: 'Valor Total', align: 'right', render: r => formatBRL(parseFloat(r.valor || r.valor_total || 0)) },
                ]}
                data={[...produtos.data, ...itensPorLoja.data]}
                loading={produtos.loading || itensPorLoja.loading}
              />
            </div>
          </div>
        )}

        {/* Comandas */}
        {activeTab === 'Comandas' && (
          <div className="space-y-6">
            {comandasAg.error && <ErrorMessage message={comandasAg.error} onRetry={comandasAg.refetch} />}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Comandas Agrupadas</h3>
              <DataTable
                columns={[
                  { key: 'data', label: 'Data', render: r => r.data || r.dt || '-' },
                  { key: 'cliente', label: 'Cliente', render: r => r.cliente || r.nome_cliente || '-' },
                  { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
                  { key: 'valor_total', label: 'Valor', align: 'right', render: r => formatBRL(parseFloat(r.valor_total || r.valor || r.total || 0)) },
                ]}
                data={comandasAg.data}
                loading={comandasAg.loading}
              />
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Itens e Comissões</h3>
              <DataTable
                columns={[
                  { key: 'profissional', label: 'Profissional', render: r => r.profissional || r.nome_profissional || '-' },
                  { key: 'descricao', label: 'Item', render: r => r.descricao || r.servico || r.item || '-' },
                  { key: 'quantidade', label: 'Qtd', align: 'right', render: r => r.quantidade || 1 },
                  { key: 'valor_total', label: 'Valor', align: 'right', render: r => formatBRL(parseFloat(r.valor_total || r.valor || 0)) },
                  { key: 'comissao', label: 'Comissão', align: 'right', render: r => formatBRL(parseFloat(r.comissao || r.comiss || 0)) },
                ]}
                data={comandasItens.data}
                loading={comandasItens.loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
