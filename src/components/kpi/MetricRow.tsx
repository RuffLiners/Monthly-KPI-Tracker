import { formatValue } from '@/lib/formatters'
import { MoMBadge } from './MoMBadge'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: number | null | undefined
  priorValue?: number | null
  unit: string
  lowerIsBetter?: boolean
  isChild?: boolean
  sku?: string
}

export function MetricRow({
  label,
  value,
  priorValue,
  unit,
  lowerIsBetter = false,
  isChild = false,
  sku,
}: Props) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className={cn('py-2 px-4 text-sm text-slate-700', isChild && 'pl-8 text-slate-500')}>
        {sku ? <span className="font-mono text-xs">{sku}</span> : label}
      </td>
      <td className="py-2 px-4 text-sm text-right font-medium text-slate-900">
        {formatValue(value, unit)}
      </td>
      <td className="py-2 px-4 text-sm text-right">
        {priorValue !== undefined ? (
          <MoMBadge current={value} prior={priorValue} lowerIsBetter={lowerIsBetter} unit={unit} />
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
    </tr>
  )
}
