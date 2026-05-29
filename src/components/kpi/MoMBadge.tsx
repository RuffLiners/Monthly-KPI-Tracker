import { formatMoMDelta } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Props {
  current: number | null | undefined
  prior: number | null | undefined
  lowerIsBetter?: boolean
  unit: string
}

export function MoMBadge({ current, prior, lowerIsBetter = false, unit }: Props) {
  const mom = formatMoMDelta(current, prior, lowerIsBetter, unit)
  if (!mom) return <span className="text-slate-400 text-sm">—</span>

  return (
    <span
      className={cn('inline-flex items-center gap-0.5 text-sm font-medium', {
        'text-green-600': mom.isGood === true,
        'text-red-500':   mom.isGood === false,
        'text-slate-500': mom.isGood === null,
      })}
    >
      {mom.direction === 'up' ? '↑' : mom.direction === 'down' ? '↓' : '→'}
      {mom.pctDisplay}
    </span>
  )
}
