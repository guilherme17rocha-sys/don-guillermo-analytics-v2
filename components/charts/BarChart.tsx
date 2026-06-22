'use client'

import {
  BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface BarChartProps {
  data: Record<string, any>[]
  bars: { key: string; label: string; color?: string }[]
  xKey: string
  formatValue?: (v: number) => string
  height?: number
}

const DEFAULT_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e']

export function BarChart({ data, bars, xKey, formatValue, height = 300 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={formatValue} />
        <Tooltip formatter={(v: any) => formatValue ? formatValue(Number(v)) : v} />
        {bars.length > 1 && <Legend />}
        {bars.map((b, i) => (
          <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]} radius={[4, 4, 0, 0]} />
        ))}
      </RechartsBar>
    </ResponsiveContainer>
  )
}
