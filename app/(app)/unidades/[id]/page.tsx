'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/ui/MetricCard'
import { DataTable } from '@/components/ui/DataTable'
import { BarChart } from '@/components/charts/BarChart'
import { useAvecData } from '@/hooks/useAvecData'
import { usePeriodo } from '@/hooks/usePeriodo'
import { useUnidades } from '@/hooks/useUnidades'
import { ArrowLeft, DollarSign, Users, TrendingUp, UserPlus, RotateCcw } from 'lucide-react'

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

const TABS = ['Resumo', 'Serviços', 'Clientes', 'Profissionais', 'Financeiro']

export default function UnidadeDetailPage() {
  const { id } = useParams()
  const { periodo } = usePeriodo()
  const { unidades } = useUnidades()
  const [activeTab, setActiveTab] = useState('Resumo')

  const unidade = unidades.find(u => u.id === String(id))

  const params = useMemo(() => ({
    inicio: periodo.inicio,
    fim: periodo.fim,
  }), [periodo])

  const faturamento = useAvecData({ reportId: 1034, params })
  const atendimentos = useAvecData({ reportId: 2005, params })
  const ticketMedio = useAvecData({ reportId: 1010, params })
  const novosClientes = useAvecData({ reportId: 2008, params })
  const retorno = useAvecData({ reportId: 1035, params })
  const servicos = useAvecData({ reportId: 1031, params, enabled: activeTab === 'Serviços' })
  const baseClientes = useAvecData({ reportId: 2007, params, enabled: activeTab === 'Clientes' })
  const profissionais = useAvecData({ reportId: 1229, params, enabled: activeTab === 'Profissionais' })
  const despesas = useAvecData({ reportId: 1386, params, enabled: activeTab === 'Financeiro' })
  const royalties = useAvecData({ reportId: 1081, params, enabled: activeTab === 'Financeiro' })

  const totalFat = faturamento.data.reduce((s, r) => s + parseFloat(r.valor || r.total || r.faturamento || 0), 0)
  const totalAt = atendimentos.data.reduce((s, r) => s + parseInt(r.total || 0), 0)
  const avgTicket = (() => {
    const vals = ticketMedio.data.map(r => parseFloat(r.ticket_medio || r.valor || 0)).filter(Boolean)
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
  })()
  const totalNovos = novosClientes.data.reduce((s, r) => s + parseInt(r.total || r.quantidade || 0), 0) || novosClientes.data.length
  const taxaRetorno = (() => {
    const vals = retorno.data.map(r => parseFloat(r.percentual_retorno || r.percentual || r.taxa || 0)).filter(Boolean)
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
  })()

  return (
    <div className="flex flex-col h-full">
      <Header title={unidade?.nome || `Unidade ${id}`} />
      <div className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/unidades" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors w-fit">
          <ArrowLeft size={16} />
          Voltar para Unidades
        </Link>

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard title="Faturamento" value={formatBRL(totalFat)} icon={DollarSign} color="green" loading={faturamento.loading} />
          <MetricCard title="Atendimentos" value={totalAt.toLocaleString('pt-BR')} icon={Users} color="blue" loading={atendimentos.loading} />
          <MetricCard title="Ticket Médio" value={formatBRL(avgTicket)} icon={TrendingUp} color="amber" loading={ticketMedio.loading} />
          <MetricCard title="Novos Clientes" value={totalNovos.toLocaleString('pt-BR')} icon={UserPlus} color="purple" loading={novosClientes.loading} />
          <MetricCard title="Taxa Retorno" value={`${taxaRetorno.toFixed(1)}%`} icon={RotateCcw} color="amber" loading={retorno.loading} />
        </div>

        {/* Abas */}
        <div className="flex border-b border-zinc-200 gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white border-t border-l border-r border-zinc-200 text-amber-600 -mb-px'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Resumo' && (
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Faturamento por Categoria</h3>
            {faturamento.loading ? (
              <div className="h-64 bg-zinc-50 animate-pulse rounded-lg flex items-center justify-center">
                <p className="text-zinc-400 text-sm">Carregando...</p>
              </div>
            ) : (
              <BarChart
                data={faturamento.data.slice(0, 10).map(r => ({
                  categoria: (r.categoria || r.descricao || r.nome || '').substring(0, 20),
                  valor: parseFloat(r.valor || r.total || 0),
                }))}
                bars={[{ key: 'valor', label: 'Valor' }]}
                xKey="categoria"
                formatValue={formatBRL}
                height={280}
              />
            )}
          </div>
        )}

        {activeTab === 'Serviços' && (
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Serviços Realizados</h3>
            <DataTable
              columns={[
                { key: 'descricao', label: 'Serviço', render: r => r.descricao || r.servico || r.nome || '-' },
                { key: 'quantidade', label: 'Qtd', align: 'right', render: r => r.quantidade || r.total || '-' },
                { key: 'valor', label: 'Valor', align: 'right', render: r => formatBRL(parseFloat(r.valor || r.faturamento || 0)) },
              ]}
              data={servicos.data}
              loading={servicos.loading}
            />
          </div>
        )}

        {activeTab === 'Clientes' && (
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Base de Clientes</h3>
            <DataTable
              columns={[
                { key: 'nome', label: 'Nome', render: r => r.nome || '-' },
                { key: 'telefone', label: 'Telefone', render: r => r.telefone || r.celular || '-' },
                { key: 'ultima_visita', label: 'Última Visita', render: r => r.ultima_visita || '-' },
              ]}
              data={baseClientes.data}
              loading={baseClientes.loading}
            />
          </div>
        )}

        {activeTab === 'Profissionais' && (
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Profissionais</h3>
            <DataTable
              columns={[
                { key: 'nome', label: 'Nome', render: r => r.nome || r.name || r.profissional || '-' },
                { key: 'status', label: 'Status', render: r => r.status || 'Ativo' },
              ]}
              data={profissionais.data}
              loading={profissionais.loading}
            />
          </div>
        )}

        {activeTab === 'Financeiro' && (
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Despesas</h3>
              <DataTable
                columns={[
                  { key: 'categoria', label: 'Categoria', render: r => r.categoria || r.descricao || '-' },
                  { key: 'valor', label: 'Valor', align: 'right', render: r => formatBRL(parseFloat(r.valor || r.total || 0)) },
                ]}
                data={despesas.data}
                loading={despesas.loading}
              />
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Royalties</h3>
              <DataTable
                columns={[
                  { key: 'faturamento_base', label: 'Fat. Base', align: 'right', render: r => formatBRL(parseFloat(r.faturamento_base || r.faturamento || 0)) },
                  { key: 'percentual_royalty', label: '% Royalty', align: 'right', render: r => `${parseFloat(r.percentual_royalty || r.percentual || 0).toFixed(1)}%` },
                  { key: 'valor_royalty', label: 'Valor', align: 'right', render: r => formatBRL(parseFloat(r.valor_royalty || r.valor || 0)) },
                ]}
                data={royalties.data}
                loading={royalties.loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
