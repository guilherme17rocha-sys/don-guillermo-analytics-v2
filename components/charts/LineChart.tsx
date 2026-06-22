'use client'

import {
  LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface LineChartProps {
  data: Record<string, any>[]
  lines: { key: string; label: string; color?: string }[]
  xKey: string
  formatValue?: (v: number) => string
  height?: number
}

const DEFAULT_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e']

export function LineChart({ data, lines, xKey, formatValue, height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLine data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
        <Tooltip formatter={(v: any) => formatValue ? formatValue(Number(v)) : v} />
        {lines.length > 1 && <Legend />}
        {lines.map((l, i) => (
          <Line
            key={l.key}
            dataKey={l.key}
            name={l.label}
            stroke={l.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLine>
    </ResponsiveContainer>
  )
}
