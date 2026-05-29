import { getSectionData } from '@/lib/kpi-queries'
import { SectionTable } from '@/components/kpi/SectionTable'
import { TrendLineChart } from '@/components/charts/TrendLineChart'

const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6']

export default async function CXPage() {
  const { months, values } = await getSectionData('cx', 12)

  const latestMonth = months[months.length - 1]
  const priorMonth = months[months.length - 2]

  const currentVals = latestMonth
    ? values.filter(v => v.month_id === latestMonth.id)
    : []
  const priorVals = priorMonth
    ? values.filter(v => v.month_id === priorMonth.id)
    : []

  const buildChartData = (metricKeys: string[]) =>
    months.map(m => {
      const row: Record<string, unknown> = { label: m.label.replace(' 20', ' \'') }
      metricKeys.forEach(k => {
        const v = values.find(v => v.month_id === m.id && v.metric_key === k)
        row[k] = v?.value ?? null
      })
      return row
    })

  const responseData = buildChartData(['cx_response_time', 'cx_resolution_time'])
  const pqData = buildChartData(['cx_pq_refund_units', 'cx_pq_replacement_units'])
  const ncxData = buildChartData(['cx_ncx_pct', 'cx_disposal_pct'])

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customer Experience</h1>
        <p className="text-slate-500 text-sm mt-1">Response times, returns, and quality metrics</p>
      </div>

      {!months.length && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
          No data available. Upload a KPI workbook to get started.
        </div>
      )}

      {months.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Response & Resolution Time (lower is better)</h2>
            <TrendLineChart
              data={responseData}
              series={[
                { key: 'cx_response_time',   label: 'Response Time',   color: COLORS[0] },
                { key: 'cx_resolution_time', label: 'Resolution Time', color: COLORS[1] },
              ]}
              unit="duration"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">PQ Refunds & Replacements</h2>
            <TrendLineChart
              data={pqData}
              series={[
                { key: 'cx_pq_refund_units',      label: 'PQ Refunds',      color: COLORS[0] },
                { key: 'cx_pq_replacement_units', label: 'PQ Replacements', color: COLORS[2] },
              ]}
              unit="int"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">NCX % & Disposal %</h2>
            <TrendLineChart
              data={ncxData}
              series={[
                { key: 'cx_ncx_pct',      label: 'NCX %',      color: COLORS[0] },
                { key: 'cx_disposal_pct', label: 'Disposal %', color: COLORS[3] },
              ]}
              unit="percent"
            />
          </div>

          <SectionTable
            section="cx"
            currentValues={currentVals as { metric_key: string; sku?: string | null; value: number | null }[]}
            priorValues={priorVals as { metric_key: string; sku?: string | null; value: number | null }[]}
          />
        </>
      )}
    </div>
  )
}
