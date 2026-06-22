'use client'

import { usePeriodo } from '@/hooks/usePeriodo'
import { useUnidades } from '@/hooks/useUnidades'
import { Calendar, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const PRESETS = [
  { key: 'hoje', label: 'Hoje' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Este mês' },
  { key: 'mes_anterior', label: 'Mês anterior' },
  { key: 'tres_meses', label: 'Últimos 3 meses' },
]

export function Header({ title }: { title: string }) {
  const { periodo, setPreset, setPeriodo } = usePeriodo()
  const { unidades, unidadeSelecionada, setUnidadeSelecionada } = useUnidades()
  const [showPeriodo, setShowPeriodo] = useState(false)
  const [customInicio, setCustomInicio] = useState('')
  const [customFim, setCustomFim] = useState('')

  function handleCustom() {
    if (customInicio && customFim) {
      const [di, mi, ai] = customInicio.split('-')
      const [df, mf, af] = customFim.split('-')
      setPeriodo({
        inicio: `${di}/${mi}/${ai}`,
        fim: `${df}/${mf}/${af}`,
        label: 'Personalizado',
      })
      setShowPeriodo(false)
    }
  }

  return (
    <header className="bg-white border-b border-zinc-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <h2 className="text-xl font-bold text-zinc-800 flex-1">{title}</h2>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Seletor de período */}
        <div className="relative">
          <button
            onClick={() => setShowPeriodo(!showPeriodo)}
            className="flex items-center gap-2 px-3 py-2 border border-zinc-300 rounded-lg text-sm bg-white hover:bg-zinc-50 transition-colors"
          >
            <Calendar size={15} className="text-zinc-500" />
            <span className="text-zinc-700">{periodo.label}</span>
            <ChevronDown size={15} className="text-zinc-400" />
          </button>

          {showPeriodo && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 p-3 w-64">
              <div className="space-y-1 mb-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => { setPreset(p.key); setShowPeriodo(false) }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      periodo.label === p.label ? 'bg-amber-100 text-amber-800 font-medium' : 'hover:bg-zinc-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-zinc-200 pt-3">
                <p className="text-xs text-zinc-500 mb-2 font-medium">Personalizado</p>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customInicio}
                    onChange={(e) => setCustomInicio(e.target.value)}
                    className="flex-1 border border-zinc-300 rounded px-2 py-1 text-xs"
                  />
                  <input
                    type="date"
                    value={customFim}
                    onChange={(e) => setCustomFim(e.target.value)}
                    className="flex-1 border border-zinc-300 rounded px-2 py-1 text-xs"
                  />
                </div>
                <button
                  onClick={handleCustom}
                  className="mt-2 w-full bg-amber-500 text-white text-xs py-1.5 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Seletor de unidade */}
        <select
          value={unidadeSelecionada}
          onChange={(e) => setUnidadeSelecionada(e.target.value)}
          className="px-3 py-2 border border-zinc-300 rounded-lg text-sm bg-white text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <option value="all">Todas as unidades</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
      </div>
    </header>
  )
}
