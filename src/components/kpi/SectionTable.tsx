import { MetricRow } from './MetricRow'
import { METRICS, SECTION_LABELS } from '@/lib/metrics'

interface KpiValue {
  metric_key: string
  sku?: string | null
  value: number | null
}

interface Props {
  section: string
  currentValues: KpiValue[]
  priorValues?: KpiValue[]
  filterChannel?: string
}

export function SectionTable({ section, currentValues, priorValues, filterChannel }: Props) {
  const sectionMetrics = METRICS
    .filter(m => m.section === section && (!filterChannel || m.channel === filterChannel))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (!sectionMetrics.length) return null

  const getVal = (values: KpiValue[], key: string): number | null | undefined => {
    const found = values.find(v => v.metric_key === key && (v.sku == null || v.sku === null))
    return found?.value
  }

  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-slate-800 mb-3">
        {SECTION_LABELS[section] ?? section}
      </h2>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-2 px-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                Metric
              </th>
              <th className="py-2 px-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
                Value
              </th>
              <th className="py-2 px-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wide">
                MoM
              </th>
            </tr>
          </thead>
          <tbody>
            {sectionMetrics.map(m => {
              const val = getVal(currentValues, m.key)
              const prior = priorValues ? getVal(priorValues, m.key) : undefined
              return (
                <MetricRow
                  key={m.key}
                  label={m.label}
                  value={val}
                  priorValue={prior}
                  unit={m.unit}
                  lowerIsBetter={m.lowerIsBetter}
                  isChild={!!m.parentKey}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
