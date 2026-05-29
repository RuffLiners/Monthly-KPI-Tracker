import { getSectionData } from '@/lib/kpi-queries'
import { SectionTable } from '@/components/kpi/SectionTable'
import { TrendLineChart } from '@/components/charts/TrendLineChart'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default async function FinancialPage() {
  const { months, values } = await getSectionData('financial', 12)
  const scorecardData = await getSectionData('scorecard', 12)

  // Build chart data
  const revenueMetrics = [
    { key: 'gross_revenue', label: 'Gross Revenue' },
  ]

  const marginMetrics = [
    { key: 'gross_margin', label: 'Gross Margin' },
    { key: 'net_margin', label: 'Net Margin' },
    { key: 'operational_overhead', label: 'Op. Overhead' },
  ]

  const tacosMetric = [
    { key: 'tacos', label: 'TACOS' },
  ]

  const buildChartData = (
    months: { id: string; period: string; label: string }[],
    vals: { month_id: string; metric_key: string; value: number | null }[],
    keys: string[],
  ) =>
    months.map(m => {
      const row: Record<string, unknown> = { label: m.label.replace(' 20', ' \'') }
      keys.forEach(k => {
        const v = vals.find(v => v.month_id === m.id && v.metric_key === k)
        row[k] = v?.value ?? null
      })
      return row
    })

  const revenueData = buildChartData(
    scorecardData.months,
    scorecardData.values as { month_id: string; metric_key: string; value: number | null }[],
    ['gross_revenue'],
  )
  const marginData = buildChartData(
    months,
    values as { month_id: string; metric_key: string; value: number | null }[],
    ['gross_margin', 'net_margin', 'operational_overhead'],
  )
  const tacosData = buildChartData(
    scorecardData.months,
    scorecardData.values as { month_id: string; metric_key: string; value: number | null }[],
    ['tacos'],
  )

  const latestMonth = months[months.length - 1]
  const priorMonth = months[months.length - 2]

  const currentVals = latestMonth
    ? values.filter(v => v.month_id === latestMonth.id)
    : []
  const priorVals = priorMonth
    ? values.filter(v => v.month_id === priorMonth.id)
    : []

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial</h1>
        <p className="text-slate-500 text-sm mt-1">Revenue, margins, and ad spend trends</p>
      </div>

      {!months.length && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
          No data available. Upload a KPI workbook to get started.
        </div>
      )}

      {months.length > 0 && (
        <>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Gross Revenue Trend</h2>
            <TrendLineChart
              data={revenueData}
              series={revenueMetrics.map((m, i) => ({ ...m, color: COLORS[i % COLORS.length] }))}
              unit="currency"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Margin Trends</h2>
            <TrendLineChart
              data={marginData}
              series={marginMetrics.map((m, i) => ({ ...m, color: COLORS[i % COLORS.length] }))}
              unit="percent"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">TACOS Trend</h2>
            <TrendLineChart
              data={tacosData}
              series={tacosMetric.map((m, i) => ({ ...m, color: '#ef4444' }))}
              unit="percent"
              referenceValue={0.17}
              referenceLabel="Target 17%"
            />
          </div>

          <SectionTable
            section="financial"
            currentValues={currentVals as { metric_key: string; sku?: string | null; value: number | null }[]}
            priorValues={priorVals as { metric_key: string; sku?: string | null; value: number | null }[]}
          />
        </>
      )}
    </div>
  )
}
