'use client'

import { useState, useEffect, useMemo } from 'react'
import { Header } from '@/components/layout/Header'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useAvecData } from '@/hooks/useAvecData'
import { usePeriodo } from '@/hooks/usePeriodo'
import { useUnidades } from '@/hooks/useUnidades'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDocs, collection } from 'firebase/firestore'
import { Target, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
}

function ProgressBar({ value, meta }: { value: number; meta: number }) {
  const pct = meta > 0 ? Math.min((value / meta) * 100, 100) : 0
  const color = pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-400' : 'bg-red-500'

  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-500 mb-1">
        <span>{pct.toFixed(0)}% atingido</span>
        <span>Meta: {meta.toLocaleString('pt-BR')}</span>
      </div>
      <div className="w-full bg-zinc-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function MetasPage() {
  const { periodo } = usePeriodo()
  const { unidades, unidadeSelecionada } = useUnidades()
  const { profile } = useAuth()
  const [metas, setMetas] = useState<Record<string, any>>({})
  const [editMeta, setEditMeta] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const params = useMemo(() => ({
    inicio: periodo.inicio,
    fim: periodo.fim,
    ...(unidadeSelecionada !== 'all' ? { salao_unidade_id: unidadeSelecionada } : {}),
  }), [periodo, unidadeSelecionada])

  const faturamento = useAvecData({ reportId: 1034, params })
  const atendimentos = useAvecData({ reportId: 2005, params })
  const novosClientes = useAvecData({ reportId: 2008, params })
  const ticketMedio = useAvecData({ reportId: 1010, params })

  const [ano, mes] = useMemo(() => {
    const parts = periodo.inicio.split('/')
    return [parts[2] || '2025', parts[1] || '01']
  }, [periodo.inicio])

  useEffect(() => {
    async function loadMetas() {
      const snap = await getDocs(collection(db, 'metas', ano, mes))
      const data: Record<string, any> = {}
      snap.docs.forEach(d => { data[d.id] = d.data() })
      setMetas(data)
      setEditMeta(data)
    }
    loadMetas()
  }, [ano, mes])

  async function handleSave() {
    setSaving(true)
    try {
      for (const [uid, meta] of Object.entries(editMeta)) {
        await setDoc(doc(db, 'metas', ano, mes, uid), meta)
      }
      setMetas(editMeta)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const realizado = useMemo(() => ({
    faturamento: faturamento.data.reduce((s, r) => s + parseFloat(r.valor || r.total || r.faturamento || 0), 0),
    atendimentos: atendimentos.data.reduce((s, r) => s + parseInt(r.total || r.atendimentos || 0), 0),
    novos_clientes: novosClientes.data.reduce((s, r) => s + parseInt(r.total || r.quantidade || 0), 0) || novosClientes.data.length,
    ticket_medio: (() => {
      const vals = ticketMedio.data.map(r => parseFloat(r.ticket_medio || r.valor || 0)).filter(Boolean)
      return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0
    })(),
  }), [faturamento.data, atendimentos.data, novosClientes.data, ticketMedio.data])

  const isAdmin = profile?.role === 'admin'

  const unidadesFiltradas = unidadeSelecionada !== 'all'
    ? unidades.filter(u => u.id === unidadeSelecionada)
    : unidades

  const metaKey = unidadeSelecionada !== 'all' ? unidadeSelecionada : 'geral'
  const metaAtual = metas[metaKey] || {}
  const editAtual = editMeta[metaKey] || {}

  function updateEdit(field: string, value: string) {
    setEditMeta(prev => ({
      ...prev,
      [metaKey]: { ...prev[metaKey], [field]: parseFloat(value) || 0 },
    }))
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Metas" />
      <div className="flex-1 p-6 overflow-auto space-y-6">

        {/* Acompanhamento */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-zinc-800">
              Acompanhamento — {periodo.label}
            </h3>
            <span className="text-sm text-zinc-400">{unidadeSelecionada === 'all' ? 'Todas as unidades' : unidades.find(u => u.id === unidadeSelecionada)?.nome}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Faturamento', key: 'faturamento', value: realizado.faturamento, format: formatBRL, loading: faturamento.loading },
              { label: 'Atendimentos', key: 'atendimentos', value: realizado.atendimentos, format: (v: number) => v.toLocaleString('pt-BR'), loading: atendimentos.loading },
              { label: 'Novos Clientes', key: 'novos_clientes', value: realizado.novos_clientes, format: (v: number) => v.toLocaleString('pt-BR'), loading: novosClientes.loading },
              { label: 'Ticket Médio', key: 'ticket_medio', value: realizado.ticket_medio, format: formatBRL, loading: ticketMedio.loading },
            ].map(({ label, key, value, format, loading }) => {
              const meta = metaAtual[key] || 0
              const pct = meta > 0 ? (value / meta) * 100 : 0
              const StatusIcon = pct >= 100 ? CheckCircle : pct >= 70 ? AlertTriangle : meta > 0 ? XCircle : Target
              const statusColor = pct >= 100 ? 'text-green-500' : pct >= 70 ? 'text-amber-400' : meta > 0 ? 'text-red-500' : 'text-zinc-300'

              return (
                <div key={key} className="bg-zinc-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-700">{label}</span>
                    <StatusIcon size={18} className={statusColor} />
                  </div>
                  {loading ? (
                    <div className="h-6 bg-zinc-200 rounded animate-pulse" />
                  ) : (
                    <p className="text-2xl font-bold text-zinc-800">{format(value)}</p>
                  )}
                  {meta > 0 ? (
                    <ProgressBar value={value} meta={meta} />
                  ) : (
                    <p className="text-xs text-zinc-400">Meta não definida</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Configuração de metas (admin) */}
        {isAdmin && (
          <div className="bg-white border border-zinc-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-zinc-800">Definir Metas — {periodo.label}</h3>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Metas'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Meta de Faturamento (R$)', key: 'faturamento' },
                { label: 'Meta de Atendimentos', key: 'atendimentos' },
                { label: 'Meta de Novos Clientes', key: 'novos_clientes' },
                { label: 'Meta de Ticket Médio (R$)', key: 'ticket_medio' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm text-zinc-600 mb-1">{label}</label>
                  <input
                    type="number"
                    value={editAtual[key] || ''}
                    onChange={(e) => updateEdit(key, e.target.value)}
                    className="w-full px-3 py-2.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-amber-400"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
