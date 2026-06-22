'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  maxRows?: number
}

function getValue(row: any, key: string): any {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

export function DataTable<T extends Record<string, any>>({
  columns, data, loading, emptyMessage = 'Nenhum dado encontrado', maxRows
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  let rows = [...data]
  if (sortKey) {
    rows.sort((a, b) => {
      const av = getValue(a, sortKey)
      const bv = getValue(b, sortKey)
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  if (maxRows) rows = rows.slice(0, maxRows)

  if (loading) {
    return (
      <div className="border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  <div className="h-3 bg-zinc-200 rounded w-20 animate-pulse" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-zinc-100">
                {columns.map((c) => (
                  <td key={String(c.key)} className="px-4 py-3">
                    <div className="h-4 bg-zinc-100 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-zinc-100">
              <td colSpan={columns.length} className="px-4 py-3 text-center text-xs text-zinc-400">
                Carregando dados...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={String(c.key)}
                  onClick={() => c.sortable !== false && handleSort(String(c.key))}
                  className={`px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide ${
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'
                  } ${c.sortable !== false ? 'cursor-pointer hover:text-zinc-800 select-none' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {c.label}
                    {c.sortable !== false && sortKey === String(c.key) && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-zinc-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors">
                  {columns.map((c) => (
                    <td
                      key={String(c.key)}
                      className={`px-4 py-3 text-sm text-zinc-700 ${
                        c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''
                      }`}
                    >
                      {c.render ? c.render(row) : String(getValue(row, String(c.key)) ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
