'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/ui/MetricCard'
import { DataTable } from '@/components/ui/DataTable'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { LineChart } from '@/components/charts/LineChart'
import { useAvecData } from '@/hooks/useAvecData'
import { usePeriodo } from '@/hooks/usePeriodo'
import { useUnidades } from '@/hooks/useUnidades'
import { Users, UserPlus, UserCheck, Percent, AlertTriangle, Download } from 'lucide-react'

const TABS = ['Base de Clientes', 'Novos Clientes', 'Retorno', 'Contatos', 'Duplicados']

export default function CrmPage() {
  const { periodo } = usePeriodo()
  const { unidadeSelecionada } = useUnidades()
  const [activeTab, setActiveTab] = useState('Base de Clientes')

  const params = useMemo(() => ({
    inicio: periodo.inicio,
    fim: periodo.fim,
    ...(unidadeSelecionada !== 'all' ? { salao_unidade_id: unidadeSelecionada } : {}),
  }), [periodo, unidadeSelecionada])

  const baseClientes = useAvecData({ reportId: 2007, params })
  const novosClientes = useAvecData({ reportId: 2008, params })
  const clientesTratados = useAvecData({ reportId: 2001, params })
  const taxaAtivacaoPeriodo = useAvecData({ reportId: 2003, params })
  const taxaAtivacaoGeral = useAvecData({ reportId: 2004, params })
  const retornoGeral = useAvecData({ reportId: 1035, params, enabled: activeTab === 'Retorno' })
  const retornoM1 = useAvecData({ reportId: 1036, params, enabled: activeTab === 'Retorno' })
  const contatos = useAvecData({ reportId: 2009, params, enabled: activeTab === 'Contatos' })
  const cpfDuplicados = useAvecData({ reportId: 1210, params, enabled: activeTab === 'Duplicados' })
  const celDuplicados = useAvecData({ reportId: 1211, params, enabled: activeTab === 'Duplicados' })

  const totalBase = baseClientes.data.length || baseClientes.data.reduce((s, r) => s + parseInt(r.total || 0), 0)
  const totalNovos = novosClientes.data.reduce((s, r) => s + parseInt(r.total || r.quantidade || 1), 0) || novosClientes.data.length
  const totalTratados = clientesTratados.data.reduce((s, r) => s + parseInt(r.total || 1), 0) || clientesTratados.data.length
  const taxaAtiv = taxaAtivacaoPeriodo.data[0]?.taxa || taxaAtivacaoPeriodo.data[0]?.percentual || 0

  function exportCSV() {
    const rows = contatos.data.map(r =>
      [r.nome || '', r.celular || r.telefone || '', r.email || '', r.unidade || r.salao || ''].join(',')
    )
    const csv = ['Nome,Celular,Email,Unidade', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contatos-${periodo.inicio.replace(/\//g, '-')}-${periodo.fim.replace(/\//g, '-')}.csv`
    a.click()
  }

  const retornoLineData = useMemo(() =>
    retornoGeral.data.slice(0, 12).map((r, i) => ({
      mes: r.mes || r.data || `Mês ${i + 1}`,
      retorno_geral: parseFloat(r.percentual_retorno || r.percentual || r.taxa || 0),
      retorno_m1: parseFloat(retornoM1.data[i]?.percentual_retorno || retornoM1.data[i]?.percentual || 0),
    })),
    [retornoGeral.data, retornoM1.data])

  return (
    <div className="flex flex-col h-full">
      <Header title="CRM" />
      <div className="flex-1 p-6 overflow-auto">

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <MetricCard title="Base de Clientes" value={totalBase.toLocaleString('pt-BR')} icon={Users} color="blue" loading={baseClientes.loading} />
          <MetricCard title="Novos Clientes" value={totalNovos.toLocaleString('pt-BR')} icon={UserPlus} color="green" loading={novosClientes.loading} />
          <MetricCard title="Clientes Tratados" value={totalTratados.toLocaleString('pt-BR')} icon={UserCheck} color="amber" loading={clientesTratados.loading} />
          <MetricCard title="Ativação do Período" value={`${parseFloat(String(taxaAtiv)).toFixed(1)}%`} icon={Percent} color="purple" loading={taxaAtivacaoPeriodo.loading} />
          <MetricCard
            title="Ativação Geral"
            value={`${parseFloat(String(taxaAtivacaoGeral.data[0]?.taxa || taxaAtivacaoGeral.data[0]?.percentual || 0)).toFixed(1)}%`}
            icon={Percent}
            color="amber"
            loading={taxaAtivacaoGeral.loading}
          />
        </div>

        {/* Abas */}
        <div className="flex border-b border-zinc-200 mb-6 gap-1 overflow-x-auto">
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

        {activeTab === 'Base de Clientes' && (
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-800 mb-4">Clientes Cadastrados</h3>
            <DataTable
              columns={[
                { key: 'nome', label: 'Nome', render: r => r.nome || r.name || '-' },
                { key: 'telefone', label: 'Telefone', render: r => r.telefone || r.celular || r.fone || '-' },
                { key: 'email', label: 'Email', render: r => r.email || '-' },
                { key: 'ultima_visita', label: 'Última Visita', render: r => r.ultima_visita || r.dt_ultima_visita || '-' },
                { key: 'total_visitas', label: 'Visitas', align: 'right', render: r => r.total_visitas || r.visitas || r.atendimentos || '-' },
              ]}
              data={baseClientes.data}
              loading={baseClientes.loading}
            />
          </div>
        )}

        {activeTab === 'Novos Clientes' && (
          <div className="space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Novos Clientes no Período</h3>
              <DataTable
                columns={[
                  { key: 'nome', label: 'Nome', render: r => r.nome || r.name || '-' },
                  { key: 'telefone', label: 'Telefone', render: r => r.telefone || r.celular || '-' },
                  { key: 'email', label: 'Email', render: r => r.email || '-' },
                  { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
                  { key: 'data', label: 'Data Cadastro', render: r => r.data || r.dt || r.data_cadastro || '-' },
                ]}
                data={novosClientes.data}
                loading={novosClientes.loading}
              />
            </div>
          </div>
        )}

        {activeTab === 'Retorno' && (
          <div className="space-y-6">
            {retornoGeral.error && <ErrorMessage message={retornoGeral.error} onRetry={retornoGeral.refetch} />}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Taxa de Retorno Comparativa</h3>
              {retornoLineData.length > 0 ? (
                <LineChart
                  data={retornoLineData}
                  lines={[
                    { key: 'retorno_geral', label: 'Retorno Geral' },
                    { key: 'retorno_m1', label: 'Retorno M-1' },
                  ]}
                  xKey="mes"
                  formatValue={(v) => `${v.toFixed(1)}%`}
                  height={280}
                />
              ) : (
                <p className="text-zinc-400 text-sm text-center py-16">Sem dados para o período</p>
              )}
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Retorno por Unidade</h3>
              <DataTable
                columns={[
                  { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
                  { key: 'total_clientes', label: 'Total Clientes', align: 'right', render: r => r.total_clientes || r.total || '-' },
                  { key: 'clientes_retorno', label: 'Retornaram', align: 'right', render: r => r.clientes_retorno || r.retorno || '-' },
                  { key: 'percentual_retorno', label: 'Taxa', align: 'right', render: r => `${parseFloat(r.percentual_retorno || r.percentual || r.taxa || 0).toFixed(1)}%` },
                ]}
                data={retornoGeral.data}
                loading={retornoGeral.loading}
              />
            </div>
          </div>
        )}

        {activeTab === 'Contatos' && (
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-zinc-800">Lista de Contatos</h3>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors"
              >
                <Download size={15} />
                Exportar CSV
              </button>
            </div>
            <DataTable
              columns={[
                { key: 'nome', label: 'Nome', render: r => r.nome || r.name || '-' },
                { key: 'celular', label: 'Celular', render: r => r.celular || r.telefone || '-' },
                { key: 'email', label: 'Email', render: r => r.email || '-' },
                { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
              ]}
              data={contatos.data}
              loading={contatos.loading}
            />
          </div>
        )}

        {activeTab === 'Duplicados' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Atenção: dados duplicados detectados</p>
                <p className="text-sm text-amber-700 mt-1">
                  CPF duplicados: <strong>{cpfDuplicados.data.length}</strong> registros —
                  Celular duplicados: <strong>{celDuplicados.data.length}</strong> registros
                </p>
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">CPF Duplicados em Todas as Unidades</h3>
              <DataTable
                columns={[
                  { key: 'nome', label: 'Nome', render: r => r.nome || '-' },
                  { key: 'cpf', label: 'CPF', render: r => r.cpf || '-' },
                  { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
                ]}
                data={cpfDuplicados.data}
                loading={cpfDuplicados.loading}
              />
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <h3 className="font-semibold text-zinc-800 mb-4">Celular Duplicados</h3>
              <DataTable
                columns={[
                  { key: 'nome', label: 'Nome', render: r => r.nome || '-' },
                  { key: 'celular', label: 'Celular', render: r => r.celular || r.telefone || '-' },
                  { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || '-' },
                ]}
                data={celDuplicados.data}
                loading={celDuplicados.loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
