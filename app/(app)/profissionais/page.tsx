'use client'

import { useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { MetricCard } from '@/components/ui/MetricCard'
import { DataTable } from '@/components/ui/DataTable'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useAvecData } from '@/hooks/useAvecData'
import { usePeriodo } from '@/hooks/usePeriodo'
import { useUnidades } from '@/hooks/useUnidades'
import { UserCheck, TrendingUp } from 'lucide-react'

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

export default function ProfissionaisPage() {
  const { periodo } = usePeriodo()
  useUnidades()

  const params = useMemo(() => ({
    inicio: periodo.inicio,
    fim: periodo.fim,
  }), [periodo])

  const profissionais = useAvecData({ reportId: 1229, params })
  const profissionais2 = useAvecData({ reportId: 2013, params })
  const adc = useAvecData({ reportId: 1106, params })

  const allProfissionais = useMemo(() => {
    const map: Record<string, any> = {}
    ;[...profissionais.data, ...profissionais2.data].forEach(r => {
      const key = r.nome || r.name || r.profissional || ''
      if (!map[key]) map[key] = { ...r }
    })
    adc.data.forEach(r => {
      const key = r.nome || r.profissional || ''
      if (map[key]) map[key].adc = r.adc || r.valor || r.ticket
    })
    return Object.values(map)
  }, [profissionais.data, profissionais2.data, adc.data])

  const avgAdc = useMemo(() => {
    const vals = adc.data.map(r => parseFloat(r.adc || r.valor || r.ticket || 0)).filter(Boolean)
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
  }, [adc.data])

  return (
    <div className="flex flex-col h-full">
      <Header title="Profissionais" />
      <div className="flex-1 p-6 overflow-auto space-y-6">
        {profissionais.error && <ErrorMessage message={profissionais.error} onRetry={profissionais.refetch} />}

        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Profissionais Ativos"
            value={allProfissionais.length.toLocaleString('pt-BR')}
            icon={UserCheck}
            color="amber"
            loading={profissionais.loading}
          />
          <MetricCard
            title="ADC Médio"
            value={formatBRL(avgAdc)}
            icon={TrendingUp}
            color="green"
            loading={adc.loading}
          />
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-800 mb-4">Lista de Profissionais</h3>
          <DataTable
            columns={[
              { key: 'nome', label: 'Nome', render: r => r.nome || r.name || r.profissional || '-' },
              { key: 'unidade', label: 'Unidade', render: r => r.unidade || r.salao || r.loja || '-' },
              { key: 'status', label: 'Status', render: r => r.status || r.situacao || 'Ativo' },
              { key: 'adc', label: 'ADC', align: 'right', render: r => r.adc ? formatBRL(parseFloat(r.adc)) : '-' },
            ]}
            data={allProfissionais}
            loading={profissionais.loading || profissionais2.loading}
          />
        </div>
      </div>
    </div>
  )
}
