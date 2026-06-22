'use client'

import { PieChart as RechartsPie, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#14b8a6', '#f97316', '#6366f1']

interface PieChartProps {
  data: { name: string; value: number }[]
  formatValue?: (v: number) => string
  height?: number
}

export function PieChart({ data, formatValue, height = 300 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPie>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: any) => formatValue ? formatValue(Number(v)) : v} />
        <Legend />
      </RechartsPie>
    </ResponsiveContainer>
  )
}
