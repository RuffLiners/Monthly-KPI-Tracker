import { SKU_LIST } from '@/lib/metrics'
import { formatValue } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface KpiValue {
  metric_key: string
  sku?: string | null
  value: number | null
}

interface Props {
  metricKey: string
  metricLabel: string
  unit: string
  lowerIsBetter?: boolean
  currentValues: KpiValue[]
  priorValues?: KpiValue[]
  warnThreshold?: number
}

export function SkuTable({
  metricKey,
  metricLabel,
  unit,
  lowerIsBetter = false,
  currentValues,
  priorValues,
  warnThreshold,
}: Props) {
  const rows = SKU_LIST.map(sku => {
    const cur = currentValues.find(v => v.metric_key === metricKey && v.sku === sku)
    const pri = priorValues?.find(v => v.metric_key === metricKey && v.sku === sku)
    return { sku, value: cur?.value ?? null, priorValue: pri?.value ?? null }
  }).filter(r => r.value !== null)

  if (!rows.length) return null

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">{metricLabel}</h3>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-2 px-4 text-left text-xs font-medium text-slate-500">SKU</th>
              <th className="py-2 px-4 text-right text-xs font-medium text-slate-500">Value</th>
              {priorValues && (
                <th className="py-2 px-4 text-right text-xs font-medium text-slate-500">Prior</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const warn =
                warnThreshold !== undefined && r.value !== null
                  ? lowerIsBetter
                    ? r.value > warnThreshold
                    : r.value < warnThreshold
                  : false
              return (
                <tr
                  key={r.sku}
                  className={cn(
                    'border-b border-slate-100',
                    warn ? 'bg-red-50' : 'hover:bg-slate-50',
                  )}
                >
                  <td className="py-2 px-4 font-mono text-xs text-slate-700">{r.sku}</td>
                  <td
                    className={cn(
                      'py-2 px-4 text-sm text-right font-medium',
                      warn ? 'text-red-600' : 'text-slate-900',
                    )}
                  >
                    {formatValue(r.value, unit)}
                  </td>
                  {priorValues && (
                    <td className="py-2 px-4 text-sm text-right text-slate-500">
                      {formatValue(r.priorValue, unit)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
