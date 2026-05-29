import { SparklineChart } from '@/components/charts/SparklineChart'
import { formatValue, formatMoMDelta } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: number | null | undefined
  priorValue?: number | null
  sparklineData?: { value: number }[]
  unit: string
  lowerIsBetter?: boolean
  goalMet?: boolean | null
  goalLabel?: string
}

export function KpiCard({
  label,
  value,
  priorValue,
  sparklineData,
  unit,
  lowerIsBetter = false,
  goalMet,
  goalLabel,
}: Props) {
  const mom =
    value != null && priorValue != null
      ? formatMoMDelta(value, priorValue, lowerIsBetter, unit)
      : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2">
      <div className="text-xs text-slate-500 font-medium uppercase tracking-wide truncate">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900">{formatValue(value, unit)}</div>
      <div className="flex items-center justify-between gap-2">
        {mom ? (
          <span
            className={cn('text-sm font-medium', {
              'text-green-600': mom.isGood === true,
              'text-red-500':   mom.isGood === false,
              'text-slate-400': mom.isGood === null,
            })}
          >
            {mom.direction === 'up' ? '↑' : mom.direction === 'down' ? '↓' : '→'}{' '}
            {mom.pctDisplay}
          </span>
        ) : (
          <span className="text-sm text-slate-400">— MoM</span>
        )}
        {goalLabel && (
          <span
            className={cn('text-xs px-1.5 py-0.5 rounded font-medium', {
              'bg-green-100 text-green-700':   goalMet === true,
              'bg-yellow-100 text-yellow-700': goalMet === false,
              'bg-slate-100 text-slate-500':   goalMet === null || goalMet === undefined,
            })}
          >
            {goalLabel}
          </span>
        )}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <SparklineChart
          data={sparklineData}
          color={mom?.isGood === false ? '#ef4444' : '#22c55e'}
        />
      )}
    </div>
  )
}
