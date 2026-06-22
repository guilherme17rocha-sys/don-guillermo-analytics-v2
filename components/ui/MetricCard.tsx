import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: { value: number; label: string }
  color?: 'amber' | 'green' | 'blue' | 'purple' | 'red'
  loading?: boolean
}

const colorMap = {
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  red: 'bg-red-50 text-red-600 border-red-200',
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, color = 'amber', loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-5">
        <div className="h-4 bg-zinc-200 rounded w-3/4 mb-3 animate-pulse" />
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 bg-zinc-200 rounded w-1/2 animate-pulse" />
        </div>
        <p className="text-xs text-zinc-400">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        {Icon && (
          <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-zinc-800 mb-1">{value}</p>
      {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          <span className="text-zinc-400 font-normal">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
